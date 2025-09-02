require("dotenv").config()
const express = require("express")
const cors = require("cors")
const dns = require("dns").promises
const app = express()

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))

// Basic Configuration
const port = process.env.PORT || 3000

app.use(cors())

app.use("/public", express.static(`${process.cwd()}/public`))

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html")
})

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" })
})

const url_list = []

app.get("/api/shorturl/:id", function (req, res) {
  try {
    const id = parseInt(req.params.id)
    if (!id) {
      return res.status(400).json({ error: "invalid parameter" })
    }
    const url = url_list[id - 1]

    if (!url) {
      return res.status(404).json({ error: "url not found" })
    }

    res.redirect(301, url)
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

app.post("/api/shorturl", async function (req, res) {
  try {
    const url = req.body.url

    if (!url) {
      return res.status(400).json({ error: "invalid body" })
    }

    if (!(await isDomainValid(url))) {
      return res.status(200).json({ error: "invalid url" })
    }

    url_list.push(url)

    res.json({ original_url: url, short_url: url_list.length })
  } catch (error) {
    res.status(500).json({ error: String(error) })
  }
})

async function isDomainValid(url) {
  try {
    const { hostname } = new URL(url)
    await dns.lookup(hostname)
    return true
  } catch {
    return false
  }
}

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
