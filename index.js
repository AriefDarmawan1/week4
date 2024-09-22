const express = require("express");
const app = express();
const port = 5000;
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const { Sequelize, QueryTypes } = require("sequelize");
const config = require("./config/config.json");
const upload = require("./middlewares/upload-file");

const sequelize = new Sequelize(config.development);

const blogModel = require("./models").blog;
const userModel = require("./models").user;

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));

app.use("/assets", express.static(path.join(__dirname, "./assets")));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    name: "my-session",
    secret: "ewVsqWOyeb",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(flash());

app.get("/", home);
app.get("/blog", blog);
app.get("/add-blog", addBlogView);
app.post("/blog", upload.single("image"), addBlog);
app.get("/delete-blog/:id", deleteBlog);
app.get("/edit-blog/:id", editBlogView);
app.post("/edit-blog/:id", upload.single("image"), editBlog);
app.get("/contact", contact);
app.get("/testimonial", testimonial);
app.get("/blog-detail/:id", blogDetail);

app.get("/login", loginView);
app.get("/register", registerView);

app.post("/register", register);
app.post("/login", login);

function loginView(req, res) {
  res.render("login");
}

// Route untuk logout
app.get("/logout", (req, res) => {
  // Hapus sesi pengguna
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/"); // Redirect ke home jika terjadi error
    }

    // Setelah sesi dihapus, redirect ke halaman login atau homepage
    res.redirect("/login");
  });
});
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect ke halaman login jika sesi tidak ada
  }
  next();
};

// Contoh penggunaan middleware pada rute yang dilindungi
app.get("/", authMiddleware, (req, res) => {
  res.render("/");
});

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // cek email user apakah ada di database
    const user = await userModel.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }

    // cek password apakah valid dengan password yang sudah di hash
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      req.flash("error", "Email / password salah!");
      return res.redirect("/login");
    }

    req.session.user = user;

    req.flash("success", "Login berhasil!");
    res.redirect("/blog");
  } catch (error) {
    req.flash("error", "Something went wrong!");
    res.redirect("/");
  }
}

function registerView(req, res) {
  res.render("register");
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await userModel.create({
      name: name,
      email: email,
      password: hashedPassword,
    });

    req.flash("success", "Register berhasil!");
    res.redirect("/login");
  } catch (error) {
    req.flash("error", "Register gagal!");
    res.redirect("/register");
  }
}

function home(req, res) {
  const user = req.session.user;

  res.render("index", { user });
}

async function blog(req, res) {
  const result = await blogModel.findAll({
    include: [
      {
        model: userModel,
        attributes: ["name"],
      },
    ],
  });

  const user = req.session.user;

  res.render("blog", { data: result, user });
}

async function deleteBlog(req, res) {
  const { id } = req.params;

  let result = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  if (!result) return res.render("not-found");

  await blogModel.destroy({
    where: {
      id: id,
    },
  });
  res.redirect("/blog");
}

async function addBlog(req, res) {
  const { title, content } = req.body;

  // Ambil nama file gambar dari req.file (hasil upload dengan multer)
  const imagePath = req.file.filename; // simpan hanya nama file

  const userId = req.session.user.id; // ID user dari session (pengguna yang login)

  // Buat entri blog baru di database
  await blogModel.create({
    title: title,
    content: content,
    image: imagePath, // Simpan nama file di kolom 'image' di database
    userId: userId,
  });

  // Redirect ke halaman blog setelah menambahkan
  res.redirect("/blog");
}

async function editBlogView(req, res) {
  const { id } = req.params;

  const result = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  if (!result) return res.render("not-found");

  res.render("edit-blog", { data: result });
}

async function editBlog(req, res) {
  const { id } = req.params;
  const { title, content } = req.body;

  const blog = await blogModel.findOne({
    where: {
      id: id,
    },
  });

  if (!blog) return res.render("not-found");

  blog.title = title;
  blog.content = content;

  // Cek apakah ada file gambar yang di-upload
  if (req.file) {
    const imagePath = req.file.filename; // Dapatkan nama file gambar baru
    blog.image = imagePath; // Update kolom gambar di database
  }

  await blog.save();

  res.redirect("/blog");
}

function addBlogView(req, res) {
  const user = req.session.user;

  if (!user) {
    return res.redirect("/login");
  }

  res.render("add-blog");
}

function contact(req, res) {
  res.render("contact");
}

function testimonial(req, res) {
  res.render("testimonial");
}

async function blogDetail(req, res) {
  const { id } = req.params;
  const result = await blogModel.findOne({
    where: {
      id: id,
    },
    include: [
      {
        model: userModel, // Sertakan relasi ke user model untuk mengambil data penulis
        attributes: ["name"], // Ambil hanya atribut yang diperlukan, misalnya 'name'
      },
    ],
  });

  if (!result) return res.render("not-found");
  res.render("blog-detail", { data: result });
}

app.listen(port, () => {
  console.log("Server is running on PORT :", port);
});
