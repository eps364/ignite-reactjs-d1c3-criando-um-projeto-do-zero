import { useState, useCallback } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import Header from '../components/Header';
import { FiCalendar, FiUser } from 'react-icons/fi';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination);

  const handleLoadMorePosts = useCallback(async () => {
    const response = await fetch(posts.next_page);
    const data = await response.json();

    setPosts(state => ({
      ...state,
      ...data,
      results: [...state.results, ...data.results],
    }));
  }, [posts]);

  return (
    <>
      <Header />
      <main className={commonStyles.container}>
        {posts.results.map(post => (
          <div key={post.uid} className={styles.postContainer}>
            <Link href="">
              <a>{post.data.title}</a>
            </Link>
            <p className={styles.subtitle}>{post.data.subtitle}</p>
            <div className={styles.metaData}>
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
            </div>
          </div>
        ))}

        {posts.next_page && (
          <div className={styles.loadMore}>
            <button
              onClick={handleLoadMorePosts}
              className={styles.loadButton}
              type="button"
            >
              Carregar mais posts
            </button>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ previewData }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'posts.title',
        'posts.author',
        'posts.subtitle',
      ],
      pageSize: 10,
      page: 1,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
    revalidate: 60 * 1
  };
};