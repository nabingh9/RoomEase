import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import re

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Read environment configuration
SUPABASE_URL = os.environ.get("https://hymqswziufembwgjwgwy.supabase.co")
SUPABASE_KEY = os.environ.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bXFzd3ppdWZlbWJ3Z2p3Z3d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDg5ODg0MywiZXhwIjoyMDk2NDc0ODQzfQ.3W0KcmY0UKAQ8VT-K5EiDrNtTjpzc4OZRmgkx-jpSqw")
BACKEND_ALLOWED_ORIGINS = os.environ.get("BACKEND_ALLOWED_ORIGINS", "*")
use_in_memory_fallback = os.environ.get("USE_IN_MEMORY_FALLBACK", "true").strip().lower() in ("1", "true", "yes", "on")

# Enable CORS for frontend communication.
# In production, set BACKEND_ALLOWED_ORIGINS to your Vercel frontend URL.
allowed_origins = (
    [origin.strip() for origin in BACKEND_ALLOWED_ORIGINS.split(",")] if BACKEND_ALLOWED_ORIGINS != "*" else "*"
)
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# Initialize Supabase client
supabase_client = None

if SUPABASE_URL and SUPABASE_KEY and "your-project-id" not in SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        use_in_memory_fallback = False
        print("✓ Successfully connected to Supabase database!")
    except Exception as e:
        print(f"⚠ Error connecting to Supabase: {e}")
        if not use_in_memory_fallback:
            raise
        print("✓ Falling back to in-memory storage for development")
else:
    if not use_in_memory_fallback:
        raise RuntimeError(
            "USE_IN_MEMORY_FALLBACK=false but Supabase credentials are missing or invalid. "
            "Set SUPABASE_URL and SUPABASE_KEY in backend/.env or enable USE_IN_MEMORY_FALLBACK=true for local development."
        )
    print("ℹ SUPABASE credentials not configured")
    print("✓ Running in Development Mode with in-memory storage")
    print("✓ All submissions are stored locally and will be reset when the server restarts")

# In-memory storage lists for fallback mode
in_memory_seekers = [
    {
        "id": "mock-seeker-1",
        "full_name": "Sarah Connor",
        "email": "sarah.c@student.unimelb.edu.au",
        "suburb": "Carlton",
        "min_budget": 200,
        "max_budget": 350,
        "room_type": "Private",
        "move_in_date": "2026-07-01",
        "smoking_allowed": False,
        "pets_allowed": True,
        "lifestyle_notes": "Studying computing. Looking for a quiet place close to campus. I enjoy cooking.",
        "created_at": "2026-06-08T10:00:00Z"
    },
    {
        "id": "mock-seeker-2",
        "full_name": "James Smith",
        "email": "jsmith@student.monash.edu",
        "suburb": "Clayton",
        "min_budget": 180,
        "max_budget": 250,
        "room_type": "Shared",
        "move_in_date": "2026-07-15",
        "smoking_allowed": False,
        "pets_allowed": False,
        "lifestyle_notes": "Active sports person. Respectful of boundaries and tidy.",
        "created_at": "2026-06-08T11:15:00Z"
    }
]

in_memory_listings = [
    {
        "id": "mock-listing-1",
        "owner_name": "David Miller",
        "email": "david.miller@gmail.com",
        "address": "12 Lygon Street",
        "suburb": "Carlton",
        "room_type": "Private",
        "weekly_rent": 320,
        "availability_date": "2026-06-25",
        "amenities": "High-speed Wi-Fi, Gym, Laundry, Fully Furnished Kitchen",
        "description": "Lovely sunlit room in Carlton. 5 minutes walk to Melbourne University. Sharing flat with two other clean students.",
        "created_at": "2026-06-08T09:30:00Z"
    },
    {
        "id": "mock-listing-2",
        "owner_name": "Elena Rostova",
        "email": "elena.r@outlook.com",
        "address": "45 Flinders Lane",
        "suburb": "Melbourne CBD",
        "room_type": "Studio",
        "weekly_rent": 450,
        "availability_date": "2026-07-01",
        "amenities": "Ensuite Bathroom, Air Conditioning, Balcony, Secure Entry",
        "description": "Private cozy studio in the heart of Melbourne. Perfect for students looking for independent living.",
        "created_at": "2026-06-08T10:45:00Z"
    }
]


# Health Check route
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "RoomEase Backend",
        "database_connected": not use_in_memory_fallback
    }), 200


# POST /api/room-seekers - Add room seeker
@app.route('/api/room-seekers', methods=['POST'])
def add_room_seeker():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    # Validation
    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip()
    suburb = data.get("suburb", "").strip()
    min_budget = data.get("min_budget")
    max_budget = data.get("max_budget")
    room_type = data.get("room_type", "").strip()
    move_in_date = data.get("move_in_date", "").strip()
    
    errors = {}
    if not full_name:
        errors["full_name"] = "Full name is required."
    if not email:
        errors["email"] = "Email is required."
    elif "@" not in email:
        errors["email"] = "Invalid email format. Must contain '@'."
    if not suburb:
        errors["suburb"] = "Preferred suburb is required."
    if min_budget is None or min_budget == "":
        errors["min_budget"] = "Minimum budget is required."
    else:
        try:
            min_budget = float(min_budget)
            if min_budget < 0:
                errors["min_budget"] = "Budget cannot be negative."
        except ValueError:
            errors["min_budget"] = "Budget must be a numeric value."
            
    if max_budget is None or max_budget == "":
        errors["max_budget"] = "Maximum budget is required."
    else:
        try:
            max_budget = float(max_budget)
            if max_budget < 0:
                errors["max_budget"] = "Budget cannot be negative."
            elif min_budget is not None and not isinstance(min_budget, str) and max_budget < min_budget:
                errors["max_budget"] = "Maximum budget must be greater than or equal to minimum budget."
        except ValueError:
            errors["max_budget"] = "Budget must be a numeric value."
            
    if not room_type:
        errors["room_type"] = "Room type is required."
    if not move_in_date:
        errors["move_in_date"] = "Move-in date is required."
        
    if errors:
        return jsonify({"validation_errors": errors}), 400

    # Prepare document for database
    seeker_record = {
        "full_name": full_name,
        "email": email,
        "suburb": suburb,
        "min_budget": min_budget,
        "max_budget": max_budget,
        "room_type": room_type,
        "move_in_date": move_in_date,
        "smoking_allowed": bool(data.get("smoking_allowed")),
        "pets_allowed": bool(data.get("pets_allowed")),
        "lifestyle_notes": data.get("lifestyle_notes", "").strip()
    }

    if use_in_memory_fallback:
        # Generate mock record
        from datetime import datetime
        import uuid
        seeker_record["id"] = str(uuid.uuid4())
        seeker_record["created_at"] = datetime.utcnow().isoformat() + "Z"
        in_memory_seekers.insert(0, seeker_record)
        return jsonify(seeker_record), 201
    else:
        try:
            response = supabase_client.table("room_seekers").insert(seeker_record).execute()
            if len(response.data) > 0:
                return jsonify(response.data[0]), 201
            else:
                return jsonify({"error": "Failed to save record to Supabase"}), 500
        except Exception as e:
            return jsonify({"error": f"Database insertion error: {str(e)}"}), 500


# GET /api/room-seekers - Get all seekers
@app.route('/api/room-seekers', methods=['GET'])
def get_room_seekers():
    if use_in_memory_fallback:
        return jsonify(in_memory_seekers), 200
    else:
        try:
            # Query from Supabase, sort by created_at descending
            response = supabase_client.table("room_seekers").select("*").order("created_at", desc=True).execute()
            return jsonify(response.data), 200
        except Exception as e:
            # Fall back to in-memory if query fails to keep demo alive
            print(f"Failed to fetch from Supabase: {e}. Returning fallback list.")
            return jsonify(in_memory_seekers), 200


# POST /api/property-listings - Add property listing
@app.route('/api/property-listings', methods=['POST'])
def add_property_listing():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    # Validation
    owner_name = data.get("owner_name", "").strip()
    email = data.get("email", "").strip()
    address = data.get("address", "").strip()
    suburb = data.get("suburb", "").strip()
    room_type = data.get("room_type", "").strip()
    weekly_rent = data.get("weekly_rent")
    availability_date = data.get("availability_date", "").strip()
    
    errors = {}
    if not owner_name:
        errors["owner_name"] = "Owner name is required."
    if not email:
        errors["email"] = "Email is required."
    elif "@" not in email:
        errors["email"] = "Invalid email format. Must contain '@'."
    if not address:
        errors["address"] = "Property address is required."
    if not suburb:
        errors["suburb"] = "Suburb is required."
    if not room_type:
        errors["room_type"] = "Room type is required."
    if weekly_rent is None or weekly_rent == "":
        errors["weekly_rent"] = "Weekly rent is required."
    else:
        try:
            weekly_rent = float(weekly_rent)
            if weekly_rent <= 0:
                errors["weekly_rent"] = "Weekly rent must be greater than zero."
        except ValueError:
            errors["weekly_rent"] = "Weekly rent must be a numeric value."
    if not availability_date:
        errors["availability_date"] = "Availability date is required."
        
    if errors:
        return jsonify({"validation_errors": errors}), 400

    # Prepare document for database
    listing_record = {
        "owner_name": owner_name,
        "email": email,
        "address": address,
        "suburb": suburb,
        "room_type": room_type,
        "weekly_rent": weekly_rent,
        "availability_date": availability_date,
        "amenities": data.get("amenities", "").strip(),
        "description": data.get("description", "").strip()
    }

    if use_in_memory_fallback:
        from datetime import datetime
        import uuid
        listing_record["id"] = str(uuid.uuid4())
        listing_record["created_at"] = datetime.utcnow().isoformat() + "Z"
        in_memory_listings.insert(0, listing_record)
        return jsonify(listing_record), 201
    else:
        try:
            response = supabase_client.table("property_listings").insert(listing_record).execute()
            if len(response.data) > 0:
                return jsonify(response.data[0]), 201
            else:
                return jsonify({"error": "Failed to save record to Supabase"}), 500
        except Exception as e:
            return jsonify({"error": f"Database insertion error: {str(e)}"}), 500


# GET /api/property-listings - Get all listings
@app.route('/api/property-listings', methods=['GET'])
def get_property_listings():
    if use_in_memory_fallback:
        return jsonify(in_memory_listings), 200
    else:
        try:
            response = supabase_client.table("property_listings").select("*").order("created_at", desc=True).execute()
            return jsonify(response.data), 200
        except Exception as e:
            print(f"Failed to fetch from Supabase: {e}. Returning fallback list.")
            return jsonify(in_memory_listings), 200


# ---------------------------
# Authentication endpoints
# ---------------------------


@app.route('/api/auth/register', methods=['POST'])
def register_user():
    data = request.json
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    email = data.get('email', '').strip()
    password = data.get('password', '')

    # Field-level validation
    field_errors = {}
    email_pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not email:
        field_errors['email'] = 'Email is required.'
    elif not re.fullmatch(email_pattern, email):
        field_errors['email'] = 'Invalid email format.'

    if not password:
        field_errors['password'] = 'Password is required.'
    elif len(password) < 6:
        field_errors['password'] = 'Password must be at least 6 characters.'

    if field_errors:
        return jsonify({"success": False, "error": "Validation failed", "field_errors": field_errors}), 400

    password_hash = generate_password_hash(password)

    user_record = {
        'email': email,
        'password_hash': password_hash
    }

    if use_in_memory_fallback:
        import uuid
        user_record['id'] = str(uuid.uuid4())
        user_record['created_at'] = datetime.utcnow().isoformat() + 'Z'
        # Store in a simple in-memory users list
        if not hasattr(app, '_in_memory_users'):
            app._in_memory_users = []
        # Check duplicate
        if any(u['email'].lower() == email.lower() for u in app._in_memory_users):
            return jsonify({"success": False, "error": "Email already registered", "field_errors": {"email": "Email already registered"}}), 409
        app._in_memory_users.insert(0, user_record)
        return jsonify({"success": True, "user": {"id": user_record['id'], "email": email}}), 201
    else:
        try:
            # Check duplicate email first
            exists = supabase_client.table('users').select('id').eq('email', email).execute()
            if exists.data and len(exists.data) > 0:
                return jsonify({"success": False, "error": "Email already registered", "field_errors": {"email": "Email already registered"}}), 409

            response = supabase_client.table('users').insert(user_record).execute()
            if response and getattr(response, 'data', None) and len(response.data) > 0:
                row = response.data[0]
                return jsonify({"success": True, "user": {"id": row['id'], "email": row['email']}}), 201
            app.logger.error('Supabase returned no data when inserting user')
            return jsonify({"success": False, "error": "Failed to create user"}), 500
        except Exception as e:
            app.logger.error('Error creating user: %s', e)
            return jsonify({"success": False, "error": "Internal server error"}), 500


@app.route('/api/auth/login', methods=['POST'])
def login_user():
    data = request.json
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    email = data.get('email', '').strip()
    password = data.get('password', '')

    # Basic validation
    field_errors = {}
    email_pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not email:
        field_errors['email'] = 'Email is required.'
    elif not re.fullmatch(email_pattern, email):
        field_errors['email'] = 'Invalid email format.'
    if not password:
        field_errors['password'] = 'Password is required.'
    if field_errors:
        return jsonify({"success": False, "error": "Validation failed", "field_errors": field_errors}), 400

    # Authenticate
    try:
        if use_in_memory_fallback:
            users = getattr(app, '_in_memory_users', [])
            user = next((u for u in users if u['email'].lower() == email.lower()), None)
            if not user or not check_password_hash(user['password_hash'], password):
                return jsonify({"success": False, "error": "Invalid email or password"}), 401
            return jsonify({"success": True, "user": {"id": user['id'], "email": user['email']}}), 200
        else:
            response = supabase_client.table('users').select('*').eq('email', email).execute()
            rows = response.data
            if not rows or len(rows) == 0:
                return jsonify({"success": False, "error": "Invalid email or password"}), 401
            row = rows[0]
            if not check_password_hash(row['password_hash'], password):
                return jsonify({"success": False, "error": "Invalid email or password"}), 401
            return jsonify({"success": True, "user": {"id": row['id'], "email": row['email']}}), 200
    except Exception as e:
        app.logger.error('Login error: %s', e)
        return jsonify({"success": False, "error": "Internal server error"}), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    # In development, use debug mode
    app.run(host='0.0.0.0', port=port, debug=True)
