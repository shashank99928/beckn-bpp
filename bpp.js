const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

app.post("/search", (req, res) => {
  const searchRequest = req.body;

  const services = findMatchingServices(searchRequest.message.intent);

  sendSearchResponse(searchRequest.context, services);

  res.json({ message: "Search request processed", ack: true });
});

function findMatchingServices(intent) {
  return [
    {
      id: "loan1",
      descriptor: {
        name: "Personal Loan",
        long_desc: "Low interest personal loan",
      },
      price: {
        currency: "INR",
        value: "50000",
      },
      category_id: "personal_loan",
      provider: {
        id: "nbfc_xyz",
        descriptor: {
          name: "NBFC XYZ",
        },
      },
    },
  ];
}

async function sendSearchResponse(context, services) {
  const responseContext = {
    ...context,
    bpp_id: "example-bpp.com",
    bpp_uri: "https://example-bpp.com/beckn",
    action: "on_search",
    message_id: uuidv4(),
    timestamp: new Date().toISOString(),
  };

  const responseMessage = {
    catalog: {
      "bpp/descriptor": {
        name: "NBFC XYZ",
      },
      "bpp/providers": [
        {
          id: "nbfc_xyz",
          descriptor: {
            name: "NBFC XYZ",
          },
          items: services,
        },
      ],
    },
  };

  const searchResponse = {
    context: responseContext,
    message: responseMessage,
  };

  const bapUrl = "http://localhost:3000/on_search";
  try {
    await axios.post(bapUrl, searchResponse);
  } catch (error) {
    console.error("Error sending search response:", error.message);
  }
}

const PORT = 3001;
app.listen(PORT, () => console.log(`BPP running on port ${PORT}`));
