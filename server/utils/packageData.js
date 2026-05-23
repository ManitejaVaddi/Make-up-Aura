export const packageDefinitions = [
  {
    title: 'Signature Bridal Package',
    price: 48000,
    serviceName: 'Bridal Signature Makeup',
    servicePrice: 15000
  },
  {
    title: 'Engagement Luxe Package',
    price: 22000,
    serviceName: 'Bridal Signature Makeup',
    servicePrice: 15000
  },
  {
    title: 'Photoshoot Glam Package',
    price: 18000,
    serviceName: 'Bridal Signature Makeup',
    servicePrice: 15000
  }
];

export function getPackageByName(name) {
  return packageDefinitions.find((pkg) => pkg.title === name) || null;
}
