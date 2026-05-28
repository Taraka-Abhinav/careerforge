export function toSkillSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\+\+/g, ' plus plus ')
    .replace(/#/g, ' sharp ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function fromSkillSlug(slug: string): string {
  return slug.replace(/-/g, ' ');
}
