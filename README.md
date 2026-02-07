# mod-search-task-solution
Ministry of Defense  Sקשבי
# WORKER – תיאור הפרויקט

פרויקט זה מורכב מ־backend ו־frontend, וכן מתיקיית WorkB עם קבצי CSV.

## מבנה הפרויקט
- backend/ – קבצי שרת Node.js (TypeScript/JavaScript), כולל ingest ו־API.
- frontend/ – אפליקציית React (TypeScript), קבצי UI ו־Dockerfile.
- WorkB/ – קבצי נתונים, כולל streets.csv וקובצי עזר נוספים.

## נתוני רחובות (CSV)
במקור קיבלנו קובץ נתונים בפורמט XLSX, ולכן הוא לא עבד ישירות עם תהליך העבודה שלנו, שנשען על קבצי CSV. כדי לפתור זאת יצרנו בעצמנו קובץ CSV חדש, המבוסס על המידע בקובץ ה־XLSX, ושילבנו אותו בפרויקט תחת WorkB (לדוגמה: streets.csv).

## איך מריצים

### אופציה 1 – הרצה עם Docker (מומלץ)

1. ודאו ש־Docker Desktop מותקן ורץ על המחשב.
2. פתחו טרמינל בתיקיית השורש של הפרויקט (זו שבה נמצא הקובץ `docker-compose.yml`).
3. הריצו:
  - `docker-compose up --build`
4. לאחר שהכול עולה:
  - Elasticsearch זמין ב־`http://localhost:9200`
  - ה־backend זמין ב־`http://localhost:5000`
  - ה־frontend זמין ב־`http://localhost:3001`

טעינת קובץ ה־CSV לאינדקס ב־Elasticsearch (דרך ה־backend):
- שלחו בקשת `POST` ל־`http://localhost:5000/load-csv`
- גוף הבקשה (JSON), לדוגמה:
  ```json
  {
   "filePath": "/data/streets.csv"
  }
  ```
  שימו לב: בתצורת Docker תיקיית `WorkB` ממופה לנתיב `/data` בתוך הקונטיינר של ה־backend, ולכן שם הקובץ צריך להיות מתוך `/data`.

### אופציה 2 – הרצה מקומית בלי Docker

#### backend (שרת Node.js)
1. בטרמינל, להיכנס לתיקייה `backend`.
2. להריץ התקנת תלויות:
  - `npm install`
3. להריץ את השרת:
  - `node server.js`

#### frontend (אפליקציית React)
1. בטרמינל נפרד, להיכנס לתיקייה `frontend`.
2. להריץ התקנת תלויות:
  - `npm install`
3. להריץ את האפליקציה:
  - `npm start`

במצב זה ה־frontend יופעל בדרך כלל על `http://localhost:3000`, וה־backend על `http://localhost:5000` (יש לוודא ששניהם משתמשים באותם כתובות/פורט בקוד).
=======
# mod-search-task-solution
Ministry of Defense  Sקשבי
