/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import UtterancesComments from '../../components/UtterancesComments';
import { PreviewButton } from '../../components/PreviewButton';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
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
  prevPost: Post | null;
  nextPost: Post | null;
  preview: boolean;
}

export default function Post({
  post,
  prevPost,
  nextPost,
  preview,
}: PostProps): JSX.Element {
  const router = useRouter();

  const postPublicationDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    { locale: ptBR }
  );

  const lastModifiedDate = format(
    new Date(post.last_publication_date),
    'dd MMM yyyy',
    { locale: ptBR }
  );

  const lastModifiedTime = format(
    new Date(post.last_publication_date),
    'HH:mm',
    { locale: ptBR }
  );

  let entireText = '';

  post.data.content.forEach(section => {
    entireText += section.heading;
    entireText += RichText.asText(section.body);
  });

  const readingTime = Math.ceil(entireText.split(/\s/g).length / 200);

  if (router.isFallback) {
    return <h2>Carregando...</h2>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      <div className={styles.content}>
        <main>
          <img
            className={styles.bannerImg}
            src={post.data.banner.url}
            alt={post.data.title}
          />

          <div className={commonStyles.container}>
            <article className={styles.post}>
              <h1>{post.data.title}</h1>

              <div className={styles.postInfos}>
                <div>
                  <span>
                    <FiCalendar color="#BBBBBB" size={20} />
                    <time>{postPublicationDate}</time>
                  </span>

                  <span>
                    <FiUser color="#BBBBBB" size={20} />
                    {post.data.author}
                  </span>

                  <span>
                    <FiClock color="#BBBBBB" size={20} />
                    <time>{readingTime} min</time>
                  </span>
                </div>

                {post.first_publication_date !== post.last_publication_date && (
                  <i className={styles.editionInfo}>
                    * editado em {lastModifiedDate} às {lastModifiedTime}
                  </i>
                )}
              </div>

              {post.data.content.map(section => (
                <div key={section.heading} className={styles.postContent}>
                  <h2>{section.heading}</h2>

                  <div
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(section.body),
                    }}
                  />
                </div>
              ))}
            </article>

            <footer className={styles.controllers}>
              {prevPost && (
                <Link href={`/post/${prevPost.uid}`}>
                  <a>
                    <span>{prevPost.data?.title}</span>
                    <strong>Post anterior</strong>
                  </a>
                </Link>
              )}

              {nextPost && (
                <Link href={`/post/${nextPost.uid}`}>
                  <a className={styles.nextPostController}>
                    <span>{nextPost.data?.title}</span>
                    <strong>Próximo post</strong>
                  </a>
                </Link>
              )}
            </footer>

            <UtterancesComments />

            {preview && <PreviewButton />}
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 3,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      fetch: ['posts.title'],
      orderings: '[document.first_publication_date desc]',
    }
  );

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: response.id,
      fetch: ['posts.title'],
      orderings: '[document.first_publication_date]',
    }
  );

  return {
    props: {
      post: response,
      prevPost: prevPost.results[0] ?? null,
      nextPost: nextPost.results[0] ?? null,
      preview,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
