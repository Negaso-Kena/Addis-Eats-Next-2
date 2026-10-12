export function getSocialImage(image) {
  return image?.replace(/\.webp$/i, "-social.jpg") ?? "/images/social-home.jpg";
}
