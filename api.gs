// ==========================================
// 熊本福岡旅遊評分網 - Google Apps Script (GAS) API
// ==========================================
// 使用說明：
// 1. 在 Google Drive 建立一個新的 Google Sheet，命名為「旅遊評分資料庫」。
// 2. 在左下角建立兩個工作表 (Sheet)，分別嚴格命名為 "Attractions" 與 "Reviews"。
//    - Attractions 第一欄標題 (A1~F1)：id, name, type, region, description, source_links
//    - Reviews 第一欄標題 (A1~E1)：attraction_id, role_name, rating, comment, timestamp
// 3. 點選上方選單「擴充功能」>「Apps Script」。
// 4. 把這個檔案的所有程式碼貼上並覆蓋原本的內容。
// 5. 點擊右上角「部署」>「新增部署作業」。
// 6. 選取類型「網頁應用程式」，執行身分選「我」，權限選「所有人」。
// 7. 部署後，把產生出來的「網頁應用程式網址 (Web App URL)」複製下來交給前端。

function getSheetData(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] === "") continue; // skip empty rows
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}

// 處理 GET 請求：回傳所有景點與評分
function doGet(e) {
  try {
    var attractions = getSheetData("Attractions");
    var reviews = getSheetData("Reviews");

    // 將 source_links 字串轉回 Array (假設資料庫存成逗號分隔或 JSON 字串)
    attractions = attractions.map(function (a) {
      if (typeof a.source_links === "string" && a.source_links.startsWith("[")) {
        try {
          a.source_links = JSON.parse(a.source_links);
        } catch (e) {
          /* ignore */
        }
      } else if (typeof a.source_links === "string") {
        a.source_links = a.source_links
          .split(",")
          .map(function (s) {
            return s.trim();
          })
          .filter(String);
      }

      // 附加上關聯的 Reviews
      a.reviews = reviews.filter(function (r) {
        return r.attraction_id === a.id;
      });
      return a;
    });

    var response = {
      status: "success",
      data: attractions,
    };

    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(
      ContentService.MimeType.JSON,
    );
  }
}

// 處理 POST 請求：接收評分並寫入或覆蓋 (對應 x-www-form-urlencoded)
function doPost(e) {
  try {
    // 解決 CORS preflight 或是無 payload 錯誤
    if (!e || !e.parameter) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "No data received" }),
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var attractionId = e.parameter.attraction_id;
    var roleName = e.parameter.role_name;
    var rating = e.parameter.rating;
    var comment = e.parameter.comment || "";
    var timestamp = new Date().toISOString();

    if (!attractionId || !roleName || rating === undefined) {
      throw new Error("Missing required parameters: attraction_id, role_name, or rating");
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reviews");
    var data = sheet.getDataRange().getValues();
    var foundObjRow = -1;

    // 尋找是否已有同一人對同一景點的評價 (列索引從 0 開始，但 sheet 從 1 開始)
    // headers: [attraction_id, role_name, rating, comment, timestamp]
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === attractionId && data[i][1] === roleName) {
        foundObjRow = i + 1; // 記錄在 Sheet 中的實體列數
        break;
      }
    }

    if (foundObjRow > 0) {
      // 覆蓋舊資料
      sheet.getRange(foundObjRow, 3).setValue(rating);
      sheet.getRange(foundObjRow, 4).setValue(comment);
      sheet.getRange(foundObjRow, 5).setValue(timestamp);
    } else {
      // 新增一筆
      sheet.appendRow([attractionId, roleName, rating, comment, timestamp]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Review saved" })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(
      ContentService.MimeType.JSON,
    );
  }
}
