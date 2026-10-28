
const http = require('http');
const { handleStaticFiles } = require("./src/handlers/staticHandler")
const { handleApiCall} = require("./src/handlers/apiHandler")
const { handlePage} = require("./src/handlers/pageHandler");
const { fetchSingleProduct, getAllProducts, getProductsById} = require("./src/services/productService");
const {getSession} = require("./src/services/sessionService");

require("./src/listeners/pageFileListeners")

const server = http.createServer(async (req, res) => {

    if (req.url.startsWith("/public/")) {
        handleStaticFiles(req, res);
        return;
    } else if (req.url.startsWith("/api/")) {
        handleApiCall(req, res);
        return;
    }

    if (req.url === "/") {
            const proizvodi = await getAllProducts();
            handlePage("home", {proizvodi: proizvodi}, req, res);
        return;
    } else if (req.url === "/about") {
        handlePage("about", {}, req, res);
        return;
    } else if(req.url === "/register") {
        handlePage("register", {}, req, res);
        return;
    } else if(req.url === "/login") {
        handlePage("login", {}, req, res);
        return;
    } else if(req.url === "/cart") {

        const user = getSession(req);
        console.log(user);

        if(!user) {
            res.writeHead(303, { "Location": "/" });
            return res.end();
        }

        const proizvodi = await getProductsById(user.shoppingCart);
        console.log(proizvodi);


        handlePage("cart", {proizvodi: proizvodi}, req, res);
        return;
    }

    const productMatch = req.url.match(/^\/product\/([\w-]+)$/);
    if(productMatch) {
        console.log(productMatch);
        const slug = productMatch[1];
        const product = await fetchSingleProduct(slug);

        if(product) {

            handlePage("permalink", {product: product}, req, res);
            return;
        }

    }
    res.writeHead(404, {"Content-Type": "text/plain"});
    return res.end("404 Not Found");
});


server.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});