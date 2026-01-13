import { Ship, User, Contact, Download } from 'lucide-react';

export const apps = [
  {
    name: 'Vessel Activity',
    description: 'View past and future cruises you have signed up for.',
    icon: Ship,
    link: 'https://v0-cruising-fleet-member-activity.vercel.app/:id', // Requires accountID
  },
  {
    name: 'Member Activity',
    description: 'View past and future events you have participated in.',
    icon: User,
    link: 'https://cruisingfleet.vercel.app/:id', // Requires contactID
  },
  {
    name: 'Vendor Directory',
    description: 'View a list of peer-recommended marine service providers.',
    icon: Contact,
    link: 'https://fleet-vendors.vercel.app/',
  },
  {
    name: 'Downloads',
    description: 'Access forms, presentations, and other useful files.',
    icon: Download,
    link: 'https://fleet-downloads.vercel.app/',
  },
];
