interface CategoryTreeNode {
  entityId: number;
  name: string;
  path: string;
  children: Array<{
    entityId: number;
    name: string;
    path: string;
    children: Array<{
      entityId: number;
      name: string;
      path: string;
    }>;
  }>;
}

export interface HeaderNavLink {
  entityId?: number;
  label: string;
  href: string;
  groups?: Array<{
    label?: string;
    href?: string;
    links: Array<{
      label: string;
      href: string;
    }>;
  }>;
}

export function categoryTreeToNavLinks(
  categoryTree: CategoryTreeNode[],
  options?: { limit?: number },
): HeaderNavLink[] {
  const tree = options?.limit != null ? categoryTree.slice(0, options.limit) : categoryTree;

  return tree.map(({ entityId, name, path, children }) => ({
    entityId,
    label: name,
    href: path,
    groups: children.map((firstChild) => ({
      label: firstChild.name,
      href: firstChild.path,
      links: firstChild.children.map((secondChild) => ({
        label: secondChild.name,
        href: secondChild.path,
      })),
    })),
  }));
}
