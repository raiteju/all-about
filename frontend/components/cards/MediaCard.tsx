import AudioCard from './AudioCard';
import VideoCard from './VideoCard';
import PostCard from './PostCard';

export default function MediaCard({ post }: { post: any }) {
  // If it's an audio post, use the specialized AudioCard
  if (post.type === 'audio') {
    return <AudioCard audio={post} />;
  }

  // If it's a video post, use the specialized VideoCard
  if (post.type === 'video') {
    return <VideoCard video={post} />;
  }

  // Otherwise, it's a regular article post
  return <PostCard post={post} />;
}