import React from 'react';
import { useEffect, useState } from 'react';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';
import { Post } from '../types/Post';
import { client } from '../utils/fetchClient';
import type { Comment, CommentData } from '../types/Comment';
import cn from 'classnames';

type PostDetailsProps = {
  post: Post;
};

export const PostDetails: React.FC<PostDetailsProps> = ({ post }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentsError, setIsCommentsError] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (post.id) {
      setIsCommentsLoading(true);
      setIsCommentsError(false);
      setIsFormVisible(false);
      setComments([]);
      client
        .get<Comment[]>(`/comments?postId=${post.id}`)
        .then(data => {
          setComments(data);
        })
        .catch(() => {
          setIsCommentsError(true);
        })
        .finally(() => {
          setIsCommentsLoading(false);
        });
    }
  }, [post.id]);

  const handleDeleteComment = (commentId: number) => {
    setComments(prevComments =>
      prevComments.filter(comment => comment.id !== commentId),
    );
    client.delete(`/comments/${commentId}`);
  };

  const handleAddComment = (commentData: CommentData) => {
    return client
      .post<Comment>('/comments', { ...commentData, postId: post.id })
      .then(addedComment => {
        setComments(prevComments => [...prevComments, addedComment]);
      });
  };

  return (
    <div className="content" data-cy="PostDetails">
      <div className="block">
        <h2 data-cy="PostTitle">{`#${post.id}: ${post.title}`}</h2>

        <p data-cy="PostBody">{post.body}</p>
      </div>

      <div className="block">
        {isCommentsLoading && <Loader />}

        {isCommentsError && (
          <div className="notification is-danger" data-cy="CommentsError">
            Something went wrong
          </div>
        )}

        {comments.length === 0 && !isCommentsLoading && !isCommentsError && (
          <p className="title is-4" data-cy="NoCommentsMessage">
            No comments yet
          </p>
        )}
        {!isCommentsLoading && !isCommentsError && comments.length > 0 && (
          <>
            <p className="title is-4">Comments:</p>
            {comments.map(comment => (
              <article
                className="message is-small"
                key={comment.id}
                data-cy="Comment"
              >
                <div className="message-header">
                  <a href={`mailto:${comment.email}`} data-cy="CommentAuthor">
                    {comment.name}
                  </a>
                  <button
                    data-cy="CommentDelete"
                    type="button"
                    className="delete is-small"
                    aria-label="delete"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    delete button
                  </button>
                </div>

                <div className="message-body" data-cy="CommentBody">
                  {comment.body}
                </div>
              </article>
            ))}
          </>
        )}
        {!isCommentsLoading && !isCommentsError && !isFormVisible && (
          <button
            data-cy="WriteCommentButton"
            type="button"
            className={cn('button is-link', { 'is-hidden': isFormVisible })}
            onClick={() => setIsFormVisible(true)}
          >
            Write a comment
          </button>
        )}
      </div>
      {isFormVisible && <NewCommentForm onAddComment={handleAddComment} />}
    </div>
  );
};
