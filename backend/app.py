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

@app.route("/",methods=["GET"])
def index():
    return "Welcome to MCPL Task Management System Server."

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
    
    cursor.execute(""" SELECT "EmpName", "OrganisationID", "UserCategory", "DesignationID", "UserEmail" 
                   FROM "UserMaster" WHERE "UserName" = %s AND "UserPWD" = %s AND "OrganisationID" = %s """,[username,password,org_id])
    
    user = cursor.fetchone()
    
    if user:
        cursor.execute(""" SELECT "DesignationName" FROM "DesignationMaster" WHERE "DesignationID" = %s """,[user[3],])
    
        designation = cursor.fetchone()
    
        return jsonify({
            "status": "success",
            "empName": user[0],
            "role": user[2],
            "designation": designation[0],
            "email": user[4]
        }), 200
    else:
        return jsonify({
            "status": "error"
        }), 500
        
@app.route("/get_all_projects",methods = ["GET"])
def get_all_projects():
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "ProjectCode", "ProjectID" FROM "ProjectMaster" ORDER BY "ProjectCode" ASC """)
    projects = [{ "code": row[0], "id": row[1] } for row in cursor.fetchall()]
    return jsonify(projects)

@app.route("/get_project_data/<code>",methods=["GET"])
def get_project_data(code):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "ProjectCode", "ProjectName" FROM "ProjectMaster" WHERE "ProjectID" = %s """,[code,])
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
    # formData.append("projectCode", selectedProjectCode);
    # formData.append("projectName", projectName);
    # formData.append("taskDesc", taskDescription);
    # formData.append("workType", selectedWorkType);
    # formData.append("assignTo", assignedToEmployee);
    # formData.append("assignBy", assignedByEmployee);
    # formData.append("remarks", remarks);
    # formData.append("deadline", deadline);
    dateOfEntry = request.form.get("dateOfEntry")
    projectCode = request.form.get("projectCode")
    taskDesc = request.form.get("taskDesc")
    workType = request.form.get("workType")
    assignTo = request.form.get("assignTo")
    assignBy = request.form.get("assignBy")
    remarks = request.form.get("remarks")
    deadline = request.form.get("deadline")
    
    targetDate = datetime.strptime(deadline, "%Y-%m-%d")
    today = datetime.strptime(dateOfEntry, "%Y-%m-%d")
    
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "UserID" FROM "UserMaster" WHERE "EmpName" = %s """,[assignBy,])
    assignBy_id = cursor.fetchone()
    
    cursor.execute(""" INSERT INTO "ProjectHistory"(
	                "ProjectID", "AssignedBy", "UserID", "DateOfEntry","Event", "Remarks","ChangeStatus?", "EventDate", "WorkTypeID","TaskStatus","TargetDate")
	                VALUES (%s, %s, %s, %s, %s, %s,True,%s,%s,'Pending',%s); """,[projectCode, assignBy_id[0], assignTo, today, taskDesc, remarks, today, workType, targetDate])
    
    conn.commit()
    
    cursor.execute(""" SELECT "UserEmail", "EmpName" FROM "UserMaster" WHERE "UserID" = %s """,[assignTo,])
    row = cursor.fetchone()
    assignToEmailDetails = { "to_email": row[0], "to_name": row[1] }
    
    return jsonify({
        "status" : "success",
        "message" : "Task Assigned Successfully",
        "empEmail" : assignToEmailDetails
        }), 200

@app.route("/getTaskUpdates/<id>",methods={"GET"})
def getTaskUpdates(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "Event", "Remarks" FROM "ProjectHistory" WHERE "ProjectHistoryID" = %s """,[id,])
    
    row = cursor.fetchone()
    taskDesc = row[0]
    remarks = row[1]
    
    return jsonify(
        {
            "taskDesc" : taskDesc,
            "remarks" : remarks
        }    
    ), 200

@app.route("/update_task_assigned",methods=["PUT"])
def updateTaskAssigned():
    
    taskId = request.form.get("taskId")
    taskDesc = request.form.get("taskDesc")
    remarks = request.form.get("remarks")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "Event", "Remarks" FROM "ProjectHistory" WHERE "ProjectHistoryID" = %s """,[taskId,])
    
    row = cursor.fetchone()
    
    task_old_desc = row[0]
    remarks_old = row[1]
    
    finalTaskDesc = task_old_desc+" | (Edited): "+taskDesc
    finalRemarks = remarks_old+" | (Edited): "+remarks
    
    
    cursor.execute(""" UPDATE "ProjectHistory" SET "Event" = %s, "Remarks" = %s WHERE "ProjectHistoryID" = %s """,[finalTaskDesc,finalRemarks,taskId])
    conn.commit()

    return jsonify({
        "status" : "success",
        "message" : "Task Updated Successfully"
    }), 200

@app.route("/get_employee_names",methods=["GET"])
def getEmpNames():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "UserID", "EmpName" FROM "UserMaster" ORDER BY "EmpName" ASC """)
    employee_names = [{ "id": row[0], "name": row[1] }for row in cursor.fetchall()]
    
    return jsonify(employee_names)

@app.route("/dashboard_tasks_assigned/<user>",methods=["GET"])
def dashboard_tasks_assigned(user):
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "UserID" FROM "UserMaster" WHERE "EmpName" = %s """,[user,])
    user_id = cursor.fetchone()
    
    cursor.execute(""" SELECT ph."ProjectHistoryID" , ph."Event", um."EmpName", pm."ProjectCode", pm."ProjectName", ph."Remarks", ph."TargetDate", ph."DateOfEntry", ph."TaskStatus"
                       FROM "ProjectHistory" ph
                       JOIN "UserMaster" um ON ph."AssignedBy" = um."UserID"
                       JOIN "ProjectMaster" pm ON ph."ProjectID" = pm."ProjectID"
                       WHERE ph."ChangeStatus?" = true AND ph."UserID" = %s ORDER BY ph."ProjectHistoryID" ASC """,[user_id[0],])
    
    tasks_assigned = [{ "id": row[0], "task_desc" : row[1], "assigned_to" : row[2], "project_details" : row[3]+" : "+row[4], "remarks" : row[5], "deadline" : row[6], "date_of_entry" : row[7], "status" : row[8] } for row in cursor.fetchall()]
    
    return jsonify(tasks_assigned), 200

@app.route("/dashboard_tasks_under_review/<user>",methods = ["GET"])
def dashboard_tasks_under_review(user):
    
    print("Requested User: ",user)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "UserID" FROM "UserMaster" WHERE "EmpName" = %s """,[user,])
    user_id = cursor.fetchone()
    print("Fetched User: ",user_id)
    
    if not user_id:
        return jsonify({"message" : "User Not Found"}), 404
    
    cursor.execute("""  SELECT um."EmpName", COUNT(*) FILTER (WHERE ph."TaskStatus" = 'Pending'), 
                        COUNT(*) FILTER (WHERE ph."TaskStatus" = 'Completed') , 
                        COUNT(*) FILTER (WHERE ph."TaskStatus" = 'Pending' AND "TargetDate" < CURRENT_DATE),
                        COUNT(*) FILTER (WHERE ph."TaskStatus" = 'Reloaded')
                        FROM "ProjectHistory" ph
                        JOIN "UserMaster" um ON ph."UserID" = um."UserID"
                        WHERE ph."AssignedBy" = %s AND ph."IsHistory" = FALSE AND ph."ChangeStatus?" = TRUE
                        GROUP BY um."EmpName";  """, [user_id[0],])
    
    tasks_under_review = [{ "name" : row[0], "pending_count" : row[1], "completed_count" : row[2], "overdue_count" : row[3], "reloaded_count" : row[4] }for row in cursor.fetchall()]
    
    # tasks_under_review = [{ "id" : row[0], "taskDesc" : row[1], "emp_name" : row[2], "project_details" : row[3]+" : "+row[4], "remarks" : row[5], "status" : row[6], "deadline" : row[7], "date_of_entry" : row[8] } for row in cursor.fetchall() ]
    
    return jsonify(tasks_under_review), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0",port = 5002, debug = True)