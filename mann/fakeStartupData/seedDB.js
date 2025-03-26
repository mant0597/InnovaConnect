import Startup from "../models/startupModel.js";
import connectDB from "../connectDB.js";

const startupData = {
  title: "random",
  description: "lorem ispus usfs fsjf agh khg jhg",
  isBootstrapped: true,
  category: "Tech",
  fundingGoal: {
    amount: 1000,
    valuation: 2000000,
  },
};
try {
  await connectDB(); // Ensure the database connection is established
} catch (err) {
  console.log("err", err);
}
const createStartup = async () => {
  try {
    const newStartup = new Startup({
      ...startupData, // Spread the object instead of JSON.stringify
      owner: "65f4c0e89f1234567890abcd",
    });

    newStartup.save().then(() => {
      console.log("Startup saved successfully:", newStartup);
    }); // Save to the database
  } catch (error) {
    console.error("Error saving startup:", error);
  }
};

// Call the function
await createStartup();
