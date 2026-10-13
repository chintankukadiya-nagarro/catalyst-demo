import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSPeekSlideshow } from './client';

runtime.registerComponent(MSPeekSlideshow, {
  type: 'section-peek-slideshow',
  label: 'Sections / Peek Slideshow (ELLE Style)',
  icon: 'carousel',
  props: {
    className: Style(),
    slides: List({
      label: 'Slides',
      type: Group({
        props: {
          imageSrc: Image({ label: 'Image' }),
          imageAlt: TextInput({ label: 'Image alt text', defaultValue: 'Banner image' }),
          imageLink: Link({ label: 'Link (URL)' }),
          tag: TextInput({ label: 'Vertical Tag (e.g. ELLE EDITOR\'S PICK)' }),
          title: TextInput({ label: 'Title (e.g. 8 Trend Outer)' }),
          subtitle: TextInput({
            label: 'Subtitle (e.g. The Complete Guide to the 8 Major Outerwear Trends)',
          }),
        },
      }),
      getItemLabel(slide) {
        return slide?.title || slide?.imageAlt || 'Slide';
      },
    }),
    slideWidthPercent: Number({
      label: 'Slide Width % (Peek effect)',
      defaultValue: 78,
      min: 50,
      max: 100,
      suffix: '%',
    }),
    aspectRatio: Select({
      label: 'Aspect Ratio',
      options: [
        { value: '21/9', label: 'Wide Banner (21:9 - ELLE standard)' },
        { value: '16/9', label: 'Medium (16:9)' },
        { value: '4/3', label: 'Taller (4:3)' },
      ],
      defaultValue: '21/9',
    }),
    autoplay: Checkbox({ label: 'Autoplay', defaultValue: true }),
    interval: Number({ label: 'Duration', defaultValue: 5, suffix: 's' }),
    showArrows: Checkbox({ label: 'Show arrows', defaultValue: true }),
    showDots: Checkbox({ label: 'Show dots (inside bottom of slide)', defaultValue: true }),
  },
});
