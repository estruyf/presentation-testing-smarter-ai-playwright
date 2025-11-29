import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const stickers = [
  {
    Id: 1,
    Title: "Suffering is only temporary, giving up lasts forever",
    Description: "This sticker carries a powerful message of resilience and hope. It is dedicated to Yves, a dear friend who faced cancer with incredible strength and determination. Yves never gave up, even in the toughest moments.",
    Image: "2025-kotk-yves.webp",
    Price: 5.00,
    Total: 50
  },
  {
    Id: 2,
    Title: "Even servers need downtime",
    Description: "This witty sticker is a must-have for IT professionals and tech enthusiasts who know the value of rest—both for servers and humans!",
    Image: "2025-even-servers-need-downtime.webp",
    Price: 3.50,
    Total: 20
  },
  {
    Id: 3,
    Title: "Smiley Flower Sticker",
    Description: "Add a splash of sparkle and attitude with this holographic daisy sticker that says precisely what you're thinking. Featuring a cheerful flower with a not-so-cheerful message — “F**k Off, Don’t Ask Me Again” — it’s perfect for your laptop, water bottle, or anywhere that needs a little bit of sass and shine. Cute but fierce 🌸🔥",
    Image: "2025-fck-off.webp",
    Price: 4.00,
    Total: 5
  },
  {
    Id: 4,
    Title: "It's brave to ask for help",
    Description: "This uplifting sticker serves as a gentle reminder that seeking help is a sign of strength, not weakness.",
    Image: "2025-its-brave-to-ask-for-help.webp",
    Price: 4.50,
    Total: 30
  },
  {
    Id: 5,
    Title: "It's ok, not to be ok",
    Description: "This heartfelt sticker delivers a message of compassion and self-care with the phrase \"It's ok, not to be ok.\" Designed to remind everyone that it’s perfectly normal to have tough days, it’s a comforting addition to any workspace or personal item.",
    Image: "2025-its-ok-not-to-be-ok.webp",
    Price: 6.00,
    Total: 15
  },
  {
    Id: 6,
    Title: "Permission granted! Take a break.",
    Description: "This cheerful sticker is the perfect nudge for workaholics and productivity enthusiasts alike! Featuring the phrase \"Permission granted! Take a break.",
    Image: "2025-permission-granted-take-a-break.webp",
    Price: 4.00,
    Total: 8
  }
];

app.get('/api/stickers', (req, res) => {
  const minStock = parseInt(req.query.min) || 0;
  
  let filteredStickers = stickers;
  
  if (minStock > 0) {
    filteredStickers = stickers.filter(s => s.Total >= minStock);
  }
  
  // Simulate network delay
  setTimeout(() => {
    res.json({ value: filteredStickers });
  }, 500);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
