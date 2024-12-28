window.addEventListener("DOMContentLoaded", async () => {
  checkLoginStatus();

  const leaderboardTable = document.getElementById("leaderboardTable");
  const uploadScoreButton = document.getElementById("uploadScoreButton");

  // 顯示載入中訊息
  leaderboardTable.innerHTML = "<tr><td colspan='3'>載入中...</td></tr>";

  try {
    // 呼叫後端 API 獲取排行榜資料
    const response = await fetch("https://web-project-btu8.onrender.com/api/leaderboard");  // 修改為 /api/leaderboard
    const leaderboardData = await response.json();

    // 清空表格
    leaderboardTable.innerHTML = "";

    // 檢查是否有排行榜資料
    if (leaderboardData.length === 0) {
      // 如果沒有資料，顯示 "暫無資料"
      leaderboardTable.innerHTML = "<tr><td colspan='3'>暫無資料</td></tr>";
    } else {
      // 動態生成排行榜表格
      leaderboardData.forEach((user, index) => {
        const row = document.createElement("tr");

        const rankCell = document.createElement("td");
        rankCell.textContent = index + 1;
        row.appendChild(rankCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = user.username;
        row.appendChild(nameCell);

        const scoreCell = document.createElement("td");
        scoreCell.textContent = user.score;
        row.appendChild(scoreCell);

        leaderboardTable.appendChild(row);
      });
    }
  } catch (error) {
    leaderboardTable.innerHTML = "<tr><td colspan='3'>無法載入排行榜資料</td></tr>";
    console.error("Failed to fetch leaderboard data:", error);
  }

  // 按下按鈕後，將本地分數上傳至後端
  uploadScoreButton.addEventListener("click", async () => {
    console.log("Upload Score button clicked");
    const username = localStorage.getItem("username");
    const userList = getUserList(); // 獲取用戶資料列表
    const currentUser = userList.find(user => user.username === username);

    if (currentUser) {
      try {
        const response = await fetch("https://web-project-btu8.onrender.com/api/leaderboard", {  // 修改為 /api/leaderboard
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: currentUser.username, score: currentUser.score }),
        });

        const result = await response.json();
        console.log(result.message);

        // 再次更新排行榜
        location.reload(); // 可以重整頁面來重新載入排行榜資料
      } catch (error) {
        console.error("Failed to upload score:", error);
      }
    } else {
      console.log("No user data found.");
    }
  });
});
