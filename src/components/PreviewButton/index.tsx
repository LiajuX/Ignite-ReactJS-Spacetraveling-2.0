import Link from 'next/link';

import styles from './previewButton.module.scss';

export function PreviewButton(): JSX.Element {
  return (
    <Link href="/api/exit-preview">
      <a className={styles.button}>Sair do modo Preview</a>
    </Link>
  );
}
