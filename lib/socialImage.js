export function getSocialImage(image) {
  if (image?.endsWith("/beyaynet.png")) {
    return "/images/beyaynet-preview-v2.jpg";
  }

  return image?.replace(/\.webp$/i, "-social.jpg") ?? "/images/social-home.jpg";
}
