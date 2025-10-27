// 快速跳过时间到评分结束
// 用法: npx hardhat run scripts/skip-time.js --network localhost

const hre = require("hardhat");

async function main() {
  const { ethers } = hre;
  
  // 获取 CarRatingVault 合约
  const CarRatingVault = await ethers.getContract("CarRatingVault");
  
  // 获取最新的评分ID
  const ratingCounter = await CarRatingVault.ratingCounter();
  
  if (ratingCounter === 0n) {
    console.log("❌ No ratings exist yet");
    return;
  }
  
  console.log(`📊 Found ${ratingCounter} rating(s)\n`);
  
  // 检查所有评分的结束时间
  for (let i = 1n; i <= ratingCounter; i++) {
    const rating = await CarRatingVault.ratings(i);
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = Number(rating.endTime);
    const timeRemaining = endTime - currentTime;
    
    console.log(`Rating #${i}: ${rating.carModel} (${rating.carYear})`);
    console.log(`  End Time: ${new Date(endTime * 1000).toLocaleString()}`);
    
    if (timeRemaining > 0) {
      console.log(`  Status: ⏳ Active (${Math.ceil(timeRemaining / 60)} minutes remaining)`);
      console.log(`  ⚡ Fast-forwarding ${timeRemaining + 60} seconds...`);
      
      // 跳过时间（结束时间 + 1 分钟）
      await hre.network.provider.send("evm_increaseTime", [timeRemaining + 60]);
      await hre.network.provider.send("evm_mine");
      
      console.log(`  ✅ Time skipped! Rating #${i} is now ended.\n`);
    } else {
      console.log(`  Status: ✅ Already ended\n`);
    }
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 All ratings are now ended!");
  console.log("🔄 Please refresh your browser to see the updated status.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

