const middleware = {
  ensureLoggedIn: (req, res, next) => {
    if (req.isAuthenticated() && req.user.verify) {
      return next();
    }
    req.flash("warning", "Please log in and verify your email first to continue");
    res.redirect("/auth/login");
  },

  ensureAdminLoggedIn: (req, res, next) => {
    if (req.isAuthenticated() && req.user.verify) {
      if (req.user.role === "admin") {
        return next();
      }
      req.flash("warning", "Access restricted to admin only!");
      return res.redirect("back");
    }

    req.session.returnTo = req.originalUrl;
    req.flash("warning", "Please log in and verify your email first to continue");
    res.redirect("/auth/login");
  },

  ensureCustomerLoggedIn: (req, res, next) => {
    if (req.isAuthenticated() && req.user.verify) {
      if (req.user.role === "customer") {
        return next();
      }
      req.flash("warning", "This route is allowed for customers only!");
      return res.redirect("back");
    }

    req.session.returnTo = req.originalUrl;
    req.flash("warning", "Please log in and verify your email first to continue");
    res.redirect("/auth/login");
  },

  ensureNotLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      req.flash("warning", "Please logout first to continue");
      if (req.user.role === "admin") return res.redirect("/admin/dashboard");
      if (req.user.role === "customer") return res.redirect("/customer/dashboard");
    }
    next();
  },
};

module.exports = middleware;
