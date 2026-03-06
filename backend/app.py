from flask import Flask, jsonify, request, session
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta, date
import psycopg2
import psycopg2.extras
import os
from urllib.parse import unquote

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
    
    cursor.execute(""" SELECT "OrgCode" FROM "OrganisationMaster" WHERE "OrganisationID" = %s """,[org_id,])
    org = cursor.fetchone()
    
    if user:
        cursor.execute(""" SELECT "DesignationName" FROM "DesignationMaster" WHERE "DesignationID" = %s """,[user[3],])
    
        designation = cursor.fetchone()
    
        return jsonify({
            "status": "success",
            "empName": user[0],
            "role": user[2],
            "designation": designation[0],
            "email": user[4],
            "org_id" : org[0]
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

@app.route("/tasks_assigned_to/<name>",methods=["GET"])
def getEmployeeTasksAll(name):
    empName = unquote(name)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if name == "All":
        cursor.execute(""" SELECT ph."ProjectHistoryID" , ph."Event", assigned_to."EmpName", assigned_by."EmpName", pm."ProjectCode", pm."ProjectName", ph."Remarks", ph."TargetDate", ph."DateOfEntry", ph."TaskStatus"
                       FROM "ProjectHistory" ph
                       JOIN "UserMaster" assigned_by ON ph."AssignedBy" = assigned_by."UserID"
                       JOIN "UserMaster" assigned_to ON ph."UserID" = assigned_to."UserID"
                       JOIN "ProjectMaster" pm ON ph."ProjectID" = pm."ProjectID"
                       WHERE ph."ChangeStatus?" = true ORDER BY ph."ProjectHistoryID" ASC """)
    
        tasksAll = [{ "id": row[0], "task_desc" : row[1], "assigned_to" : row[2], "assigned_by" : row[3], "project_details" : row[4]+" : "+row[5], "remarks" : row[6], "deadline" : row[7], "date_of_entry" : row[8], "status" : row[9] } for row in cursor.fetchall()]
        return jsonify(tasksAll), 200
    else:
        print("Looking for ",empName)
        cursor.execute(""" SELECT "UserID" FROM "UserMaster" WHERE "EmpName" = %s """,[empName,])
        user_id = cursor.fetchone()
        
        cursor.execute(""" SELECT ph."ProjectHistoryID" , ph."Event", assigned_to."EmpName", assigned_by."EmpName", pm."ProjectCode", pm."ProjectName", ph."Remarks", ph."TargetDate", ph."DateOfEntry", ph."TaskStatus"
                       FROM "ProjectHistory" ph
                       JOIN "UserMaster" assigned_by ON ph."AssignedBy" = assigned_by."UserID"
                       JOIN "UserMaster" assigned_to ON ph."UserID" = assigned_to."UserID"
                       JOIN "ProjectMaster" pm ON ph."ProjectID" = pm."ProjectID"
                       WHERE ph."ChangeStatus?" = true AND ph."UserID" = %s ORDER BY ph."ProjectHistoryID" ASC """,[user_id[0],])
    
        tasks_assigned = [{ "id": row[0], "task_desc" : row[1], "assigned_to" : row[2], "assigned_by" : row[3], "project_details" : row[4]+" : "+row[5], "remarks" : row[6], "deadline" : row[7], "date_of_entry" : row[8], "status" : row[9] } for row in cursor.fetchall()]
        return jsonify(tasks_assigned), 200

@app.route("/get_employee_tasks/<name>",methods=["GET"])
def getEmployeeTasks(name):
    empName = unquote(name)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT ph."ProjectHistoryID" , ph."Event", pm."ProjectCode", pm."ProjectName", ph."Remarks", ph."TargetDate", ph."DateOfEntry", ph."TaskStatus", CASE WHEN ph."TaskStatus" = 'Pending' AND ph."TargetDate" < CURRENT_DATE THEN TRUE ELSE FALSE END AS "isOverdue"
                       FROM "ProjectHistory" ph
                       JOIN "ProjectMaster" pm ON ph."ProjectID" = pm."ProjectID"
                       WHERE ph."ChangeStatus?" = true AND ph."UserID" IN (SELECT "UserID" FROM "UserMaster" WHERE "EmpName" = %s) ORDER BY ph."ProjectHistoryID" ASC """,[empName,])
    
    tasks = [{ "id": row[0], "taskDesc" : row[1], "projectDetails" : row[2] + " : "+row[3], "remarks" : row[4], "deadline" : row[5], "dateOfEntry" : row[6], "status" : row[7], "isOverdue" : row[8] } for row in cursor.fetchall()]
    
    return jsonify(tasks), 200

@app.route("/getAdminPanelLists",methods=["GET"])
def getAdminPanelLists():
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" 
                   SELECT um."UserID", um."EmpName", dm."DesignationName", bm."BranchName" 
                   FROM "UserMaster" um 
                   JOIN "DesignationMaster" dm ON um."DesignationID" = dm."DesignationID" 
                   JOIN "BranchMaster" bm ON um."BranchID" = bm."BranchID" WHERE um."IsActive" = TRUE ORDER BY um."UserID" ASC; """)
    
    employees = [{"id" : row[0], "name" : row[1], "designation" : row[2], "branch" : row[3]}for row in cursor.fetchall()]
    
    cursor.execute(""" SELECT "ProjectID", "ProjectCode", "ProjectName" FROM "ProjectMaster" ORDER BY "ProjectCode" ASC; """)
    projects = [{"id" : row[0], "code" : row[1], "name" : row[2]}for row in cursor.fetchall()]
    
    cursor.execute(""" SELECT "WorkTypeID", "WorkType" FROM "WorkTypeMaster" ORDER BY "WorkType" ASC; """)
    workType = [{"id" : row[0], "name" : row[1]}for row in cursor.fetchall()]
    
    cursor.execute(""" SELECT "OrganisationID", "OrgName" FROM "OrganisationMaster" ORDER BY "OrganisationName" ASC """)
    organisations = [{"id" : row[0], "name" : row[1]}for row in cursor.fetchall()]
    
    return jsonify({
        "employees" : employees,
        "projects" : projects,
        "workTypes" : workType,
        "organisations" : organisations
    }), 200

@app.route("/markInactive/<name>",methods=["PUT"])
def markInactive(name):
    empName = unquote(name)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" UPDATE "UserMaster" SET "IsActive" = FALSE WHERE "EmpName" = %s """,[empName,])
    conn.commit()
    
    return jsonify({
        "status" : "success",
        "message": empName+" has been marked inactive."
        }), 200

@app.route("/addProject",methods=["POST"])
def addProject():
    data = request.form
    projectCode = data.get("projectCode")
    projectName = data.get("projectName")
    clientName = data.get("clientName")
    clientAddress = data.get("clientAddr")
    clientContact = data.get("clientContact")
    remarks = data.get("remarks")
    org = data.get("org")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "OrganisationID" FROM "OrganisationMaster" WHERE "OrgCode" = %s """,[org,])
    org_id = cursor.fetchone()
    
    cursor.execute(""" INSERT INTO "ProjectMaster"
                   ("ProjectCode", "ProjectGUID", "OrganisationID", "ProjectName", "ClientName", "ClientAddress", "ClientContactInfo", "Remarks") 
                   VALUES (%s, gen_random_uuid(), %s, %s, %s, %s, %s, %s) """,[projectCode, org_id[0], projectName, clientName, clientAddress, clientContact, remarks])
    conn.commit()
    
    return jsonify({
        "status" : "success",
        "message" : "Project Created Successfully."
    }), 200

@app.route("/addEmployee", methods=["POST"])
def addEmployee():
    data = request.form
    employeeName = data.get("empName")
    userName = employeeName.split(" ")[0]
    employeeEmail = data.get("empEmail")
    dob = data.get("dob")
    doj = data.get("doj")
    designation = data.get("designation")
    org_code = data.get("organisation")
    branch = data.get("branch")
    userPwd = userName+"@7"
    role = data.get("role")
    
    dob = datetime.strptime(dob, "%Y-%m-%d")
    doj = datetime.strptime(doj,"%Y-%m-%d")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "OrganisationID" FROM "OrganisationMaster" WHERE "OrgCode" = %s """,[org_code,])
    org = cursor.fetchone()
    
    cursor.execute(""" INSERT INTO "UserMaster"
                   ("UserGUID", "EmpName", "UserEmail", "UserName", "UserPWD", "UserCategory", "DateOfBirth", "DateOfJoining", 
                   "DesignationID", "BranchID", "OrganisationID")
                   VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",[employeeName, employeeEmail, userName, userPwd, role, dob, doj, designation, branch, org[0]])
    conn.commit()
    
    return jsonify({ "status" : "success", "message" : "Employee Added Successfully to the database." }), 200

@app.route("/addWorkType", methods=["POST"])
def addWorkType():
    data = request.form
    workType = data.get("workType")
    remarks = data.get("remarks")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" INSERT INTO "WorkTypeMaster"("WorkTypeMasterGUID", "WorkType", "Remarks") VALUES (gen_random_uuid(), %s, %s) """,[workType, remarks])
    conn.commit()
    
    return jsonify({ "status" : "success", "message" : "Work Type Added Successfully to the database." }), 200

@app.route("/get_work_type", methods=["GET"])
def getWorkType():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "WorkTypeID", "WorkType" FROM "WorkTypeMaster" ORDER BY "WorkType" ASC """)
    work_type = [{ "id": row[0], "work_type": row[1] } for row in cursor.fetchall()]
    
    return jsonify(work_type), 200

@app.route("/assign_task",methods = ["POST"])
def assignTask():
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
    
    updatedTaskDesc = "Task Desc: "+taskDesc+". Current Status: Pending. Deadline: "+deadline
    updatedRemarks = "Remarks: "+remarks
    
    cursor.execute(""" SELECT "UserID" FROM "UserMaster" WHERE "EmpName" = %s """,[assignBy,])
    assignBy_id = cursor.fetchone()
    
    cursor.execute(""" INSERT INTO "ProjectHistory"(
	                "ProjectID", "AssignedBy", "UserID", "DateOfEntry","Event", "Remarks","ChangeStatus?", "EventDate", "WorkTypeID","TaskStatus","TargetDate")
	                VALUES (%s, %s, %s, %s, %s, %s,True,%s,%s,'Pending',%s); """,[projectCode, assignBy_id[0], assignTo, today, updatedTaskDesc, updatedRemarks, today, workType, targetDate])
    
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

@app.route("/update_tasks_under_review",methods=["PUT"])
def updateTasksUnderReview():
    formData = request.form
    
    taskDescUpdates = formData.get("taskDescUpdates")
    status = formData.get("status")
    remarksUpdates = formData.get("remarksUpdates")
    taskId = formData.get("id")
    editedBy = formData.get("editedBy")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "Event", "Remarks" FROM "ProjectHistory" WHERE "ProjectHistoryID" = %s """,[taskId,])
    taskDetails = cursor.fetchone()
    
    newTaskDesc = taskDetails[0]+". (Edited by"+editedBy+"): "+taskDescUpdates
    newRemarks = taskDetails[1]+". (Edited by"+editedBy+"): "+remarksUpdates
    
    if status == "Cleared":
        cursor.execute(""" UPDATE "ProjectHistory" SET 
                       "Event" = %s, "Remarks" = %s, "TaskStatus" = %s, "ChangeStatus?" = False WHERE "ProjectHistoryID" = %s """,[newTaskDesc, newRemarks, status, taskId])
        conn.commit()
        return jsonify({
            "status" : "success",
            "message" : "Task Updated Successfully."
        }), 200
    else:
        cursor.execute(""" UPDATE "ProjectHistory" SET 
                       "Event" = %s, "Remarks" = %s, "TaskStatus" = %s WHERE "ProjectHistoryID" = %s """,[newTaskDesc, newRemarks, status, taskId])
        conn.commit()
        return jsonify({
            "status" : "success",
            "message" : "Task Updated Successfully."
        }), 200

@app.route("/get_employee_names",methods=["GET"])
def getEmpNames():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "UserID", "EmpName" FROM "UserMaster" ORDER BY "EmpName" ASC """)
    employee_names = [{ "id": row[0], "name": row[1] }for row in cursor.fetchall()]
    
    return jsonify(employee_names), 200

@app.route("/getDesignationAndBranch",methods=["GET"])
def getDesignationsAndBranch():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "DesignationID", "DesignationName" FROM "DesignationMaster" ORDER BY "DesignationName" ASC """)
    designations = [{"id" : row[0], "name" : row[1]}for row in cursor.fetchall()]
    
    cursor.execute(""" SELECT "BranchID", "BranchName" FROM "BranchMaster" ORDER BY "BranchName" ASC """)
    branches = [{"id" : row[0], "name" : row[1]}for row in cursor.fetchall()]
    
    return jsonify({
        "designations" : designations,
        "branches" : branches
    }), 200

@app.route("/project_history",methods=["POST"])
def projectHistory():
    
    # formData.append("type", type);
    # formData.append("dateOfEntry", dateOfEntry);
    # formData.append("eventDate", eventDate);
    # formData.append("projectCode", selectedProjectCode);
    # formData.append("workType", selectedWorkType);
    # formData.append("assignerName", assignerName);
    # formData.append("timeSpent", timeSpent);
    # formData.append("eventDesc", eventDesc);
    # formData.append("remarks", remarks);
    type = request.form.get("type")
    dateOfEntry = datetime.strptime(request.form.get("dateOfEntry"),"%Y-%m-%d")
    eventDate = request.form.get("eventDate")
    projectCode = request.form.get("projectCode")
    workType = request.form.get("workType")
    assignedBy = request.form.get("assignerName")
    timeSpent = float(request.form.get("timeSpent"))
    eventDesc = request.form.get("eventDesc")
    remarks = request.form.get("remarks")
    filledBy = request.form.get("filledBy")
    rework = request.form.get("rework")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "ProjectID" FROM "ProjectMaster" WHERE "ProjectCode" = %s """,[projectCode,])
    projectId = cursor.fetchone()
    
    cursor.execute(""" SELECT "UserID" FROM "UserMaster" WHERE "EmpName" = %s """,[filledBy,])
    userId = cursor.fetchone()
    
    if type == "performed":
        cursor.execute("""
                    INSERT INTO "ProjectHistory" (
                        "ProjectID", "UserID", "ProjectHistoryGUID", 
                        "DateOfEntry", "EventDate", "Event", "Remarks", 
                        "IsHistory", "WorkTypeID", "AssignedBy", "ChangeStatus?", "TimeSpent", "IsRework"
                    )
                    VALUES (%s, %s, gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, False, %s, %s)
                """,[projectId[0],userId[0],dateOfEntry, eventDate, eventDesc, remarks, False, workType, assignedBy, timeSpent, rework])
        conn.commit()
    else:
        cursor.execute("""
                    INSERT INTO "ProjectHistory" (
                        "ProjectID", "UserID", "ProjectHistoryGUID", 
                        "DateOfEntry", "EventDate", "Event", "Remarks", 
                        "IsHistory", "WorkTypeID", "ChangeStatus?", "TimeSpent", "IsRework"
                    )
                    VALUES (%s, %s, gen_random_uuid(), %s, %s, %s, %s, %s, %s, False, %s, %s)
                """,[projectId[0],userId[0],dateOfEntry, eventDate, eventDesc, remarks, True, workType, timeSpent, rework])
        conn.commit()
    
    return jsonify({
        "status" : "success",
        "message" : "Record Saved Successfully..//"
        }), 200

@app.route("/dashboard_tasks_assigned/<user>",methods=["GET"])
def dashboard_tasks_assigned(user):
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    decodedUser = unquote(user)
    
    cursor.execute(""" SELECT "UserID" FROM "UserMaster" WHERE "EmpName" = %s """,[decodedUser,])
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
    
    decodedUser = unquote(user)
    print("Decoded User: ", decodedUser)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(""" SELECT "UserID" FROM "UserMaster" WHERE "EmpName" = %s """,[decodedUser,])
    user_id = cursor.fetchone()
    print("Fetched User: ",user_id)
    
    if not user_id:
        return jsonify({"message" : "User Not Found"}), 404
    
    cursor.execute("""  SELECT um."EmpName", COUNT(*) FILTER (WHERE ph."TaskStatus" = 'Pending'), 
                        COUNT(*) FILTER (WHERE ph."TaskStatus" = 'Cleared') , 
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