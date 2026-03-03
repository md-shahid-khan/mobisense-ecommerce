import "server-only";
import ImageKit from "imagekit";

if (
    !process.env.IMAGE_PUBLIC_KEY ||
    !process.env.IMAGE_PRIVATE_KEY ||
    !process.env.IMAGEKIT_URL_ENDPOINT
) {
    throw new Error("ImageKit environment variables are missing");
}

const imagekit = new ImageKit({
    publicKey: process.env.IMAGE_PUBLIC_KEY,
    privateKey: process.env.IMAGE_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export default imagekit;