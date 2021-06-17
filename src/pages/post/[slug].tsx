import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { getPrismicClient } from '../../services/prismic';
import * as readingTime from 'reading-time'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import Header from '../../components/Header';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

interface FormatReadingTime {
  heading: string;
  body: {
    text: string;
  }[];
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const estimatedReadingTime = (contents: FormatReadingTime[]): number => {
    const words = contents.reduce((acc: [], item) => {
      const asText = RichText.asText(item.body);
      const textSplit = asText.split(' ').filter(text => text);
      return [...acc, ...textSplit];
    }, []);
    const estimatedTime = Math.ceil(words.length / 200);
    return estimatedTime;
  };

  return (
    <>
      <Header />
      <section className={styles.bannerContainer}>
        <img src={post.data.banner.url} alt={post.data.banner.alt} />
      </section>
      <main className={commonStyles.container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <section className={styles.metaData}>
          <div>
            <FiCalendar />
            <span>
              {format(new Date(post.first_publication_date), 'd MMM yyy', {
                locale: ptBR,
              })}
            </span>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            <span>{`${estimatedReadingTime(post.data.content)} min`}</span>
          </div>
        </section>

        <section className={styles.content}>
          {post.data.content.map(content => (
            <div className={styles.postSection} key={content.heading}>
              <h1>{content.heading}</h1>
              {content.body.map(bodyContent => (
                <p key={bodyContent.text}>{bodyContent.text}</p>
              ))}
            </div>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', slug as string, {});
  return {
    props: {
      post: response,
    },
  };
};