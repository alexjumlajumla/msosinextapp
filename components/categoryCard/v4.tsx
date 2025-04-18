import { Category } from "interfaces";
import React from "react";
import cls from "./v4.module.scss";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import FallbackImage from "components/fallbackImage/fallbackImage"; // Use FallbackImage

type Props = {
  data: Category;
  parent?: string;
};

export default function CategoryCard({ data, parent }: Props) {
  const { query } = useRouter();
  return (
    <Link
      href={{
        pathname: !!parent
          ? `/shop-category/${parent}`
          : `/shop-category/${data.uuid}`,
        query: !!parent ? { sub: data.id } : undefined,
      }}
      shallow={!!parent}
      replace={!!parent}
      className={cls.link} // Add a class for styling the link container if needed
    >
      <div
        className={`${cls.card} ${
          Number(query?.sub) === data.id ? cls.active : ""
        }`}
      >
        <div className={cls.imgContainer}> {/* Wrapper for round image */}
          <div className={cls.img}> {/* Apply className to this wrapper div */}
            <FallbackImage // Use FallbackImage
              width={60} // Adjust size as needed
              height={60} // Adjust size as needed
              // className prop removed as it's not accepted by FallbackImage
              alt={data.translation?.title || "category"}
              src={data.img || ""}
            />
          </div>
        </div>
        <span className={cls.text}>{data.translation?.title}</span>
      </div>
    </Link>
  );
}
