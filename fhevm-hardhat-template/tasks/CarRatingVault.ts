import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("car-rating:create", "Create a new car rating")
  .addParam("model", "Car model name")
  .addParam("year", "Car year")
  .addParam("description", "Rating description")
  .addParam("dimensions", "Comma-separated dimension names")
  .addParam("duration", "Duration in seconds", "86400")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const { model, year, description, dimensions, duration } = taskArguments;
    
    const carRatingVault = await ethers.getContract("CarRatingVault");
    const [signer] = await ethers.getSigners();

    const dimensionArray = dimensions.split(",").map((d: string) => d.trim());
    const endTime = Math.floor(Date.now() / 1000) + parseInt(duration);

    console.log("Creating rating...");
    console.log("  Model:", model);
    console.log("  Year:", year);
    console.log("  Dimensions:", dimensionArray);
    console.log("  End Time:", new Date(endTime * 1000).toISOString());

    const tx = await carRatingVault
      .connect(signer)
      .createRating(model, parseInt(year), description, dimensionArray, endTime);

    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log: any) => log.fragment?.name === "RatingCreated"
    );

    if (event) {
      const ratingId = event.args[0];
      console.log("✅ Rating created successfully!");
      console.log("  Rating ID:", ratingId.toString());
      console.log("  Creator:", event.args[1]);
    }
  });

task("car-rating:info", "Get rating information")
  .addParam("id", "Rating ID")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const { id } = taskArguments;
    
    const carRatingVault = await ethers.getContract("CarRatingVault");
    const rating = await carRatingVault.getRating(id);

    console.log("Rating Information:");
    console.log("  ID:", rating.id.toString());
    console.log("  Creator:", rating.creator);
    console.log("  Car Model:", rating.carModel);
    console.log("  Car Year:", rating.carYear.toString());
    console.log("  Description:", rating.description);
    console.log("  Dimensions:", rating.dimensions);
    console.log("  End Time:", new Date(Number(rating.endTime) * 1000).toISOString());
    console.log("  Participants:", rating.participantCount.toString());
    console.log("  Active:", Date.now() / 1000 < Number(rating.endTime) ? "Yes" : "No");
  });

task("car-rating:list", "List all ratings")
  .addOptionalParam("start", "Start ID", "1")
  .addOptionalParam("count", "Count", "10")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const { start, count } = taskArguments;
    
    const carRatingVault = await ethers.getContract("CarRatingVault");
    const total = await carRatingVault.getRatingCount();
    const ratings = await carRatingVault.getRatings(parseInt(start), parseInt(count));

    console.log(`Total Ratings: ${total.toString()}`);
    console.log(`Showing ${ratings.length} ratings:\n`);

    for (const rating of ratings) {
      if (rating.exists) {
        const isActive = Date.now() / 1000 < Number(rating.endTime);
        console.log(`[${rating.id}] ${rating.carModel} (${rating.carYear})`);
        console.log(`  Creator: ${rating.creator}`);
        console.log(`  Participants: ${rating.participantCount}`);
        console.log(`  Status: ${isActive ? "Active" : "Ended"}`);
        console.log(`  Dimensions: ${rating.dimensions.join(", ")}`);
        console.log("");
      }
    }
  });

task("car-rating:my-creations", "List my created ratings")
  .addOptionalParam("address", "User address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const { address } = taskArguments;
    
    const carRatingVault = await ethers.getContract("CarRatingVault");
    const [signer] = await ethers.getSigners();
    const userAddress = address || signer.address;

    const creations = await carRatingVault.getUserCreations(userAddress);

    console.log(`Ratings created by ${userAddress}:`);
    console.log(`Total: ${creations.length}\n`);

    for (const ratingId of creations) {
      const rating = await carRatingVault.getRating(ratingId);
      const isActive = Date.now() / 1000 < Number(rating.endTime);
      
      console.log(`[${rating.id}] ${rating.carModel} (${rating.carYear})`);
      console.log(`  Status: ${isActive ? "Active" : "Ended"}`);
      console.log(`  Participants: ${rating.participantCount}`);
      console.log("");
    }
  });

task("car-rating:my-participations", "List my participated ratings")
  .addOptionalParam("address", "User address")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const { address } = taskArguments;
    
    const carRatingVault = await ethers.getContract("CarRatingVault");
    const [signer] = await ethers.getSigners();
    const userAddress = address || signer.address;

    const participations = await carRatingVault.getUserParticipations(userAddress);

    console.log(`Ratings participated by ${userAddress}:`);
    console.log(`Total: ${participations.length}\n`);

    for (const ratingId of participations) {
      const rating = await carRatingVault.getRating(ratingId);
      const isActive = Date.now() / 1000 < Number(rating.endTime);
      
      console.log(`[${rating.id}] ${rating.carModel} (${rating.carYear})`);
      console.log(`  Creator: ${rating.creator}`);
      console.log(`  Status: ${isActive ? "Active" : "Ended"}`);
      console.log("");
    }
  });

task("car-rating:allow-decrypt", "Allow decryption for a rating (creator only)")
  .addParam("id", "Rating ID")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const { id } = taskArguments;
    
    const carRatingVault = await ethers.getContract("CarRatingVault");
    const [signer] = await ethers.getSigners();

    const rating = await carRatingVault.getRating(id);
    
    if (rating.creator.toLowerCase() !== signer.address.toLowerCase()) {
      console.error("❌ Error: Only the creator can allow decryption");
      return;
    }

    if (Date.now() / 1000 < Number(rating.endTime)) {
      console.error("❌ Error: Rating has not ended yet");
      return;
    }

    console.log("Allowing decryption for rating", id);
    const tx = await carRatingVault.connect(signer).allowDecryption(id);
    await tx.wait();

    console.log("✅ Decryption allowed successfully!");
  });

