export interface PageHelpContent {
  title: string;
  description: string;
  everyone: string[];
  managers?: string[];
}

export const pageHelp: Record<string, PageHelpContent> = {
  '/dashboard': {
    title: 'About the Dashboard',
    description:
      'A quick overview of your inventory: totals, sales activity, and anything needing attention.',
    everyone: [
      'View stock totals, sales/cost value, and recent activity',
      'See which products are running low on stock',
    ],
  },
  '/categories': {
    title: 'About Categories',
    description: 'Categories group your products for easier organization and filtering.',
    everyone: ['View the full list of categories'],
    managers: ['Create, edit, and delete categories'],
  },
  '/suppliers': {
    title: 'About Suppliers',
    description: 'Suppliers are the vendors you purchase products from, with their contact details on file.',
    everyone: ['View the full list of suppliers and their contact information'],
    managers: ['Create, edit, and delete suppliers'],
  },
  '/products': {
    title: 'About Products',
    description:
      'Products are the individual items in your inventory, each linked to a category and supplier, with pricing and live stock levels.',
    everyone: ['View products, including price, stock level, category, and supplier'],
    managers: ['Create, edit, and delete products'],
  },
  '/transactions': {
    title: 'About Transactions',
    description:
      'Every purchase, sale, or manual adjustment that changes a product\'s stock is recorded here as a transaction.',
    everyone: [
      'Record a purchase, sale, or adjustment for any product',
      'View the full transaction history',
    ],
  },
  '/invitations': {
    title: 'About Invitations',
    description: 'Invite new people to join your company account with a specific role.',
    everyone: [],
    managers: [
      'Send invitations to new admins or staff',
      'Cancel a pending invitation before it\'s accepted',
    ],
  },
  '/users': {
    title: 'About Users',
    description: 'Manage the people who have access to your company account.',
    everyone: [],
    managers: [
      'Deactivate or reactivate a user\'s account',
      'Revoke a user\'s active login sessions',
    ],
  },
};