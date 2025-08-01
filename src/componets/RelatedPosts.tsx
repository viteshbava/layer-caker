'use client';

import Link from 'next/link';
import { createDataAttribute } from 'next-sanity';
import { POST_QUERYResult } from '@/sanity/types';
import { client } from '@/sanity/lib/client';
import { useOptimistic } from 'react';

const { projectId, dataset, stega } = client.config();
export const createDataAttributeConfig = {
  projectId,
  dataset,
  baseUrl: typeof stega.studioUrl === 'string' ? stega.studioUrl : '',
};

export function RelatedPosts({
  relatedPosts,
  documentId,
  documentType,
}: {
  relatedPosts: NonNullable<POST_QUERYResult>['relatedPosts'];
  documentId: string;
  documentType: string;
}) {
  const [posts] = useOptimistic(
    relatedPosts,
    (
      state: NonNullable<POST_QUERYResult>['relatedPosts'],
      action: {
        id: string;
        document?: { relatedPosts?: NonNullable<POST_QUERYResult>['relatedPosts'] };
      }
    ) => {
      if (action.id === documentId && action?.document?.relatedPosts) {
        return action.document.relatedPosts.map(
          (post) => state?.find((p) => p._key === post._key) ?? post
        );
      }
      return state;
    }
  );

  if (!posts) {
    return null;
  }
  return (
    <aside className='border-t'>
      <h2>Related Posts</h2>
      <div className='not-prose text-balance'>
        <ul
          className='flex flex-col sm:flex-row gap-0.5'
          data-sanity={createDataAttribute({
            ...createDataAttributeConfig,
            id: documentId,
            type: documentType,
            path: 'relatedPosts',
          }).toString()}>
          {posts.map((post) => (
            <li
              key={post._key}
              className='p-4 bg-blue-50 sm:w-1/3 flex-shrink-0'
              data-sanity={createDataAttribute({
                ...createDataAttributeConfig,
                id: documentId,
                type: documentType,
                path: `relatedPosts[_key=="${post._key}"]`,
              }).toString()}>
              <Link href={`/posts/${post?.slug?.current}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
