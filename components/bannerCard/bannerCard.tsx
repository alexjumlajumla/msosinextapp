import Image from 'next/image';
import Link from 'next/link';
import styles from './bannerCard.module.scss';

interface BannerCardProps {
  data: {
    id: number;
    img: string;
    translation?: {
      title?: string;
    };
    url?: string;
  };
}

export default function BannerCard({ data }: BannerCardProps) {
  const content = (
    <div className={styles.bannerCard}>
      <Image
        src={data.img}
        alt={data.translation?.title || `Banner ${data.id}`}
        layout="fill"
        objectFit="cover"
        priority
      />
    </div>
  );

  if (data.url) {
    return (
      <Link href={data.url} className={styles.link}>
        {content}
      </Link>
    );
  }

  return content;
} 