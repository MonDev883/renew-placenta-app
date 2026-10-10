const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  { name: "Renew Placenta Classic Soap", cat: "Soap", price: "₱98.00", size: "135g", blurb: "The flagship bar — wheat placenta enzymes for brighter, smoother skin.", best: true },
  { name: "Renew Placenta White Soap", cat: "Soap", price: "₱98.00", size: "135g", blurb: "A gentler whitening formulation for daily use." },
  { name: "Renew Glutathione Soap", cat: "Soap", price: "₱114.00", size: "135g", blurb: "Antioxidant-rich glutathione for an even, radiant tone.", best: true },
  { name: "Renew Kojic Multi Berries Soap", cat: "Soap", price: "₱104.00", size: "135g", blurb: "Kojic acid with berry extracts to fade dark spots over time." },
  { name: "Renew Kojic Glutathione Soap", cat: "Soap", price: "₱104.00", size: "135g", blurb: "Kojic acid paired with glutathione for a brighter, more even tone." },
  { name: "Renew Papaya Fruity Soap", cat: "Soap", price: "₱75.00", size: "135g", blurb: "Natural papaya enzymes gently exfoliate for smoother skin." },
  { name: "Renew Milk Cream Vanilla Soap", cat: "Soap", price: "₱76.00", size: "135g", blurb: "A creamy, mild bar with a warm vanilla scent." },
  { name: "Renew Firming Soap", cat: "Soap", price: "₱49.00", size: "135g", blurb: "An affordable everyday bar for firmer-feeling skin." },
  { name: "Renew Papaya Cubes Soap", cat: "Soap", price: "₱70.00", size: "135g", blurb: "Papaya extract soap with a distinctive cube shape." },
  { name: "Renew Natural Oatmeal Honey Scrub Soap", cat: "Soap", price: "₱81.00", size: "135g", blurb: "Oatmeal and honey combine for a gentle, exfoliating scrub bar." },
  { name: "Renew Orange 4-in-1 Soap", cat: "Soap", price: "₱69.00", size: "135g", blurb: "A vitamin C-rich citrus bar with four skin benefits in one." },
  { name: "Renew Facial Care Soap", cat: "Soap", price: "₱78.00", size: "135g", blurb: "Formulated specifically for daily facial cleansing." },
  { name: "Renew Placenta Lotion", cat: "Skincare", price: "₱138.00", size: "120ml", blurb: "Lightweight, everyday hydration that pairs with the Classic bar." },
  { name: "Renew Placenta Cream", cat: "Skincare", price: "₱144.00", size: "25g", blurb: "A richer night treatment for mature or drier skin." },
  { name: "Renew Placenta Toner", cat: "Skincare", price: "₱133.00", size: "100ml", blurb: "A refreshing toner to complete the Placenta skincare routine." },
  { name: "Truderm Deo Roll-on Ultra", cat: "Skincare", price: "₱87.00", size: "75ml", blurb: "Long-lasting protection in the classic Ultra scent." },
  { name: "Truderm Deo Roll-on Kalamansi", cat: "Skincare", price: "₱87.00", size: "75ml", blurb: "A citrus-fresh take on all-day deodorant protection." },
  { name: "Truderm Papaya Tropical Fruits Soap", cat: "Soap", price: "₱75.00", size: "135g", blurb: "A tropical fruit-infused bar for gentle daily cleansing." },
  { name: "Truderm Placenta W/ Milk Soap", cat: "Soap", price: "₱173.00", size: "135g", blurb: "Placenta and milk extracts combine for deep nourishment." },
  { name: "Truderm Tawas Soap", cat: "Soap", price: "₱92.00", size: "135g", blurb: "A traditional alum-based bar for deep cleansing." },
  { name: "Truderm Turn-White Lotion", cat: "Skincare", price: "₱58.00", size: "120ml", blurb: "A daily lotion formulated to even out skin tone." },
  { name: "Renew Black Seed Hair & Body Soap", cat: "Soap", price: "₱98.00", size: "90g", blurb: "Black seed oil in a dual-use bar for hair and body." },
  { name: "Pureform Dr. Garcia Snail Collagen Soap", cat: "Soap", price: "₱114.00", size: "135g", blurb: "Snail collagen extract for firmer, more supple skin." },
  { name: "Pureform Antibacterial Soap", cat: "Soap", price: "₱58.00", size: "135g", blurb: "A dependable everyday bar with antibacterial protection." },
  { name: "Renew Guava Soap", cat: "Soap", price: "₱83.00", size: "135g", blurb: "Guava extract soap for a fresh, clean feel." },
  { name: "Renew Tomato Soap", cat: "Soap", price: "₱83.00", size: "135g", blurb: "Tomato extract soap rich in natural antioxidants." },
  { name: "Renew Gluta Lemon Soap", cat: "Soap", price: "₱104.00", size: "135g", blurb: "Glutathione and lemon extract for a bright, even tone." },
  { name: "Renew Gluta Mansi Soap", cat: "Soap", price: "₱104.00", size: "135g", blurb: "Glutathione with kalamansi for a citrus-fresh brightening bar." },
  { name: "Renew Carrot Soap", cat: "Soap", price: "₱98.00", size: "135g", blurb: "Carrot extract soap for a nourishing daily cleanse." },
  { name: "Renew Glutathione Hand & Body Lotion", cat: "Skincare", price: "₱XX.XX", size: "XXXml", blurb: "Glutathione-infused lotion for soft, even-toned hands and body." },
  { name: "Renew Neoceuticals Acne Foam Wash", cat: "Skincare", price: "₱XX.XX", size: "160ml", blurb: "A foaming face wash with hyaluronic acid, niacinamide, rose water and aloe vera extract." },
  { name: "Renew Neoceuticals Acne Clearing Toner", cat: "Skincare", price: "₱XX.XX", size: "100ml", blurb: "A clearing toner with aloe vera extract from the Neoceuticals acne line." },
  { name: "Renew Neoceuticals Acne Gel", cat: "Skincare", price: "₱XX.XX", size: "50g", blurb: "Witch hazel, niacinamide and D-panthenol gel that reduces redness and irritation, fades pimple marks and fights breakouts." },
  { name: "Renew Glutathione Facial Day Cream", cat: "Skincare", price: "₱XX.XX", size: "20g", blurb: "A daily facial cream with glutathione for a brighter-looking complexion." },
  { name: "Renew Niacinamide W/ Hyaluronic Acid Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "A cleansing bar made with niacinamide and hyaluronic acid." },
  { name: "Renew Hyaluronic W/ Salicylic Acid Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "A cleansing bar made with hyaluronic acid and salicylic acid." },
  { name: "Truderm Tawas Crystal", cat: "Skincare", price: "₱XX.XX", size: "XXg", blurb: "A natural alum crystal for everyday deodorant protection." },
  { name: "Pureform Virginity Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "A feminine hygiene soap that helps neutralize odor-causing germs and itchiness.", scope: "export" },
  { name: "Pureform Transparent Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "A gentle soap ideal for dry and sensitive skin, helping it retain its natural moisture.", scope: "export" },
  { name: "Pureform Sulfur Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "Formulated to help treat acne and dermatitis, reducing sebum while removing dead skin cells.", scope: "export" },
  { name: "Pureform Slimming Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "Helps protect skin cells from aging while naturally reshaping the body and reducing the look of cellulite.", scope: "export" },
  { name: "Pureform Retinoic Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "Formulated to help prevent dark spots and wrinkles; continuous use helps brighten the skin.", scope: "export" },
  { name: "Pureform Dr. Garcia Snail Collagen Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "Restores the skin's moisture, leaving it soft and moisturized while helping prevent wrinkles.", scope: "export" },
  { name: "Pureform Bleaching Soap (180g)", cat: "Soap", price: "₱XX.XX", size: "180g", blurb: "An effective skin whitener that renews, moisturizes, and tightens skin.", scope: "export" },
  { name: "Pureform Bleaching Soap (60g)", cat: "Soap", price: "₱XX.XX", size: "60g", blurb: "An effective skin whitener that renews, moisturizes, and tightens skin.", scope: "export" },
  { name: "NEO-SOAP", cat: "Soap", price: "₱XX.XX", size: "100g", blurb: "A whitening soap enriched with papaya extract to nourish and brighten skin in 7 days.", scope: "export" },
  { name: "Pureform Milk Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "A gentle, nutrient-rich cleanser that keeps skin nourished and hydrated.", scope: "export" },
  { name: "Pureform Goat Milk Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "A gentle, nourishing soap that creates a creamy lather to exfoliate the skin.", scope: "export" },
  { name: "Pureform Cucumber-Milk Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "ADD PRODUCT DESCRIPTION HERE.", scope: "export" },
  { name: "Pureform Charcoal Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "ADD PRODUCT DESCRIPTION HERE.", scope: "export" },
  { name: "Pureform Camel Milk Soap", cat: "Soap", price: "₱XX.XX", size: "160g", blurb: "ADD PRODUCT DESCRIPTION HERE.", scope: "export" },
  { name: "Renew 4-in-1 Papaya Herbal Soap", cat: "Soap", price: "₱XX.XX", size: "135g", blurb: "Enriched with actives to whiten, moisturize, cleanse, and improve overall skin health.", scope: "export" },
  { name: "Renew Black Seed Soap", cat: "Soap", price: "₱XX.XX", size: "90g", blurb: "Fights the signs of aging, lessens acne and scars, and helps relieve eczema.", scope: "export" },
];

async function run(){
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Products already exist (${count} found) — skipping seed.`);
    process.exit(0);
  }
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  process.exit(0);
}

run();