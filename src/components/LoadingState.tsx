import { Loader } from './Loader';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({ 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <Loader />
      <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        {content}
      </div>
    );
  }

  return content;
}
