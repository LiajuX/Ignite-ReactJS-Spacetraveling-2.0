import { useEffect } from 'react';

export default function UtterancesComments(): JSX.Element {
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');

    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.setAttribute('repo', process.env.NEXT_PUBLIC_GITHUB_REPO_NAME);
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'blog-comment');
    script.setAttribute('theme', 'dark-blue');

    anchor.appendChild(script);
  }, []);

  return <div id="inject-comments-for-uterances" />;
}
