from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta, date
import psycopg2
import psycopg2.extras
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'
load_dotenv()

CORS(app)

def get_db_connection():
    return psycopg2.connect(
        database= os.environ.get("DB"),
        host= os.environ.get("DB_HOST"),
        user=os.environ.get("DB_USER"),
        password=os.environ.get("DB_PASS"),
        port=os.environ.get("DB_PORT")
    )

@app.route("/validate_org_code/<code>",methods=["GET","POST"])
def validate_org_code(code):
    
    conn = get_db_connection()
    
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "OrganisationID" FROM "OrganisationMaster" WHERE "OrgCode" = %s """,[code,])
    result = cursor.fetchone()
    
    if len(result) <= 0:
        return jsonify({
            "status": "error",
            "message": "Invalid Organisation Code."
        }), 404
    
    org_id = result[0]
    
    return jsonify({
        "status": "success",
        "message": "Org Code Is Valid",
        "org_id": org_id
    }), 200
    
@app.route("/login",methods=["POST"])
def login():
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    username = request.form.get("username")
    password = request.form.get("password")
    org_id = request.form.get("org_id")
    
    print(username)
    print(password)
    print(org_id)
    
    cursor.execute(""" SELECT "EmpName", "OrganisationID", "UserCategory", "DesignationID" 
                   FROM "UserMaster" WHERE "UserName" = %s AND "UserPWD" = %s AND "OrganisationID" = %s """,[username,password,org_id])
    
    user = cursor.fetchone()
    
    if user:
        cursor.execute(""" SELECT "DesignationName" FROM "DesignationMaster" WHERE "DesignationID" = %s """,[user[3],])
    
        designation = cursor.fetchone()
    
        return jsonify({
            "status": "success",
            "empName": user[0],
            "role": user[2],
            "designation": designation[0]
        })
    else:
        return jsonify({
            "status": "error"
        }), 500
        
@app.route("/get_all_projects",methods = ["GET"])
def get_all_projects():
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "ProjectCode", "ProjectName" FROM "ProjectMaster" ORDER BY "ProjectCode" ASC """)
    projects = [{ "code": row[0], "name": row[1] } for row in cursor.fetchall()]
    return jsonify(projects)

@app.route("/get_project_data/<code>",methods=["GET"])
def get_project_data(code):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "ProjectCode", "ProjectName" FROM "ProjectMaster" WHERE "ProjectCode" = %s """,[code,])
    project_details = cursor.fetchone()
    
    if len(project_details) <= 0:
        return jsonify({ "status": 'error', "message": 'Project Not Found. 404 Error.' }), 404
    
    return jsonify({ "project_code": project_details[0], "project_name": project_details[1] }), 200

@app.route("/get_work_type",methods = ["GET"])
def getWorkType():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "WorkTypeID", "WorkType" FROM "WorkTypeMaster" ORDER BY "WorkType" ASC """)
    work_type = [{ "id": row[0], "work_type": row[1] } for row in cursor.fetchall()]
    
    return jsonify(work_type), 200

@app.route("/assign_task",methods = ["POST"])
def assignTask():
    data = request.json
    
    
    return jsonify()

@app.route("/get_employee_names",methods=["GET"])
def getEmpNames():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "UserID", "EmpName" FROM "UserMaster" ORDER BY "EmpName" ASC """)
    employee_names = [{ "id": row[0], "name": row[1] }for row in cursor.fetchall()]
    
    return jsonify(employee_names)

if __name__ == '__main__':
    app.run(host="0.0.0.0",port = 5002, debug = True)