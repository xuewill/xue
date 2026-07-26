export interface AlbumPhoto {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  tilt: number;
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutterSpeed: string;
  iso: string;
}

export const albumPhotos: readonly AlbumPhoto[] = [
  {
    id: 'night-market-table',
    src: '/home/art/art-01.jpg',
    alt: 'A vivid mixed-media painting of diners gathered around a night-market table.',
    width: 1179,
    height: 1600,
    tilt: -0.45,
    camera: 'NIKON Z 50',
    lens: '50.0 mm f/2.8',
    focalLength: '50 mm',
    aperture: 'ƒ/3',
    shutterSpeed: '1/40 s',
    iso: '200'
  },
  {
    id: 'crossing',
    src: '/home/art/art-02.jpg',
    alt: 'A mixed-media street scene with two older pedestrians crossing in opposite directions.',
    width: 898,
    height: 1600,
    tilt: 0.35,
    camera: 'NIKON Z 50',
    lens: '50.0 mm f/2.8',
    focalLength: '50 mm',
    aperture: 'ƒ/5',
    shutterSpeed: '1/100 s',
    iso: '200'
  },
  {
    id: 'station-crowd',
    src: '/home/art/art-03.jpg',
    alt: 'A panoramic mixed-media painting of commuters moving through a busy station.',
    width: 1600,
    height: 724,
    tilt: -0.25,
    camera: 'NIKON Z 50',
    lens: '50.0 mm f/2.8',
    focalLength: '50 mm',
    aperture: 'ƒ/4.5',
    shutterSpeed: '1/80 s',
    iso: '200'
  },
  {
    id: 'market-stall',
    src: '/home/art/art-04.jpg',
    alt: 'A blue and orange night-market painting with two vendors beside a lit stall.',
    width: 1037,
    height: 1600,
    tilt: 0.5,
    camera: 'NIKON Z 50',
    lens: '50.0 mm f/2.8',
    focalLength: '50 mm',
    aperture: 'ƒ/4',
    shutterSpeed: '1/60 s',
    iso: '200'
  },
  {
    id: 'platform',
    src: '/home/art/art-05.jpg',
    alt: 'A bright mixed-media painting of travelers waiting beside a metro train.',
    width: 1600,
    height: 1052,
    tilt: -0.35,
    camera: 'NIKON Z 50',
    lens: '50.0 mm f/2.8',
    focalLength: '50 mm',
    aperture: 'ƒ/4.5',
    shutterSpeed: '1/80 s',
    iso: '200'
  },
  {
    id: 'night-rider',
    src: '/home/art/art-06.jpg',
    alt: 'A cyclist passing through a layered city street painted in deep blue and orange.',
    width: 1600,
    height: 1135,
    tilt: 0.25,
    camera: 'NIKON Z 50',
    lens: '50.0 mm f/2.8',
    focalLength: '50 mm',
    aperture: 'ƒ/4.5',
    shutterSpeed: '1/80 s',
    iso: '200'
  },
  {
    id: 'old-street',
    src: '/home/art/art-07.jpg',
    alt: 'A turquoise and amber painting of an old street lined with market stalls.',
    width: 1092,
    height: 1600,
    tilt: -0.3,
    camera: 'NIKON Z 50',
    lens: '50.0 mm f/2.8',
    focalLength: '50 mm',
    aperture: 'ƒ/5',
    shutterSpeed: '1/100 s',
    iso: '200'
  },
  {
    id: 'fragments',
    src: '/home/art/from-fragments.jpg',
    alt: 'A torn-edge mixed-media artwork combining a face, streets, vehicles, and colorful marks.',
    width: 1188,
    height: 1600,
    tilt: 0.4,
    camera: 'NIKON Z 50',
    lens: '50.0 mm f/2.8',
    focalLength: '50 mm',
    aperture: 'ƒ/3.2',
    shutterSpeed: '1/250 s',
    iso: '160'
  },
  {
    id: 'rainy-reflections',
    src: '/home/art/rainy-reflections.jpg',
    alt: 'A saturated city painting with reflected lights, signs, pedestrians, and a scooter rider.',
    width: 1600,
    height: 1275,
    tilt: -0.2,
    camera: 'Apple iPhone 13',
    lens: 'Wide camera',
    focalLength: '5.1 mm',
    aperture: 'ƒ/1.6',
    shutterSpeed: '1/60 s',
    iso: '250'
  },
  {
    id: 'lane-737',
    src: '/home/art/737-lane-neihu.jpg',
    alt: 'A layered mixed-media painting of a crowded Taipei lane at night.',
    width: 1600,
    height: 1137,
    tilt: 0.3,
    camera: 'Apple iPhone 13',
    lens: 'Wide camera',
    focalLength: '5.1 mm',
    aperture: 'ƒ/1.6',
    shutterSpeed: '1/40 s',
    iso: '500'
  }
];
