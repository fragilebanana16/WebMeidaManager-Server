const express = require("express"); // web framework for Node.js.
const morgan = require("morgan"); // HTTP request logger middleware for node.js

const routes = require("./routes/index");

const rateLimit = require("express-rate-limit"); // Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.
const helmet = require("helmet"); // Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
const {  sessionMiddleware,  wrap,} = require("./controllers/serverController");

// These headers are set in response by helmet

// Content-Security-Policy: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
// Cross-Origin-Embedder-Policy: require-corp
// Cross-Origin-Opener-Policy: same-origin
// Cross-Origin-Resource-Policy: same-origin
// Origin-Agent-Cluster: ?1
// Referrer-Policy: no-referrer
// Strict-Transport-Security: max-age=15552000; includeSubDomains
// X-Content-Type-Options: nosniff
// X-DNS-Prefetch-Control: off
// X-Download-Options: noopen
// X-Frame-Options: SAMEORIGIN
// X-Permitted-Cross-Domain-Policies: none
// X-XSS-Protection: 0

const mongosanitize = require("express-mongo-sanitize"); // This module searches for any keys in objects that begin with a $ sign or contain a ., from req.body, req.query or req.params.

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query

const xss = require("xss-clean"); // Node.js Connect middleware to sanitize user input coming from POST body, GET queries, and url params.

const bodyParser = require("body-parser"); // Node.js body parsing middleware.

// Parses incoming request bodies in a middleware before your handlers, available under the req.body property.

const cors = require("cors"); // CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
// const cookieParser = require("cookie-parser"); // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
// const session = require("cookie-session"); // Simple cookie-based session middleware.



const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000', // wlan文件上传需要设置为固定ip

    methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
    credentials: true, //
    //   Access-Control-Allow-Credentials is a header that, when set to true , tells browsers to expose the response to the frontend JavaScript code. The credentials consist of cookies, authorization headers, and TLS client certificates.
  })
);

app.use(express.static(__dirname + '/public'));

// app.use(cookieParser());

// Setup express response and body parser configurations
app.use(express.json({ limit: "10kb" })); // Controls the maximum request body size. If this is a number, then the value specifies the number of bytes; if it is a string, the value is passed to the bytes library for parsing. Defaults to '100kb'.
app.use(bodyParser.json()); // Returns middleware that only parses json
app.use(bodyParser.urlencoded({ extended: true })); // Returns middleware that only parses urlencoded bodies

// app.use(
//   session({
//     secret: "keyboard cat",
//     proxy: true,
//     resave: true,
//     saveUnintialized: true,
//     cookie: {
//       secure: false,
//     },
//   })
// );

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // In one hour
  message: "Too many Requests from this IP, please try again in an hour!",
});

app.use("/tawk", limiter);

app.use(
  express.urlencoded({
    extended: true,
  })
); // Returns middleware that only parses urlencoded bodies

app.use(mongosanitize());

app.use(xss());

app.use(sessionMiddleware);

app.use(function (req, res, next) {
  req.session.test = "test";
  next();
});
app.use(routes);

app.get('/post', async (req,res) => {
  res.json(
  [
      {_id:'1',title:'first',summary:'1sum',cover:'stock-1.jpg',content:'something just like this1',createdAt:'2024-02-18T03:18:24.208Z',author:'admin1'},
      {_id:'2',title:'second',summary:'2sum',cover:'stock-2.jpg',content:'something just like this2',createdAt:'2024-02-18T03:18:24.208Z',author:'admin2'},
      {_id:'3',title:'third',summary:'3sum',cover:'stock-3.jpg',content:'something just like this3',createdAt:'2024-02-18T03:18:24.208Z',author:'admin3'},
  ]
  );
  // res.json(
  //   await Post.find()
  //     .populate('author', ['username'])
  //     .sort({createdAt: -1})
  //     .limit(20)
  // );
});

module.exports = app;