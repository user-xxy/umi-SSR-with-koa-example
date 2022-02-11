import { IGetInitialProps } from 'umi';
import styles from './index.less';

function IndexPage(props: any) {
  const {
    todoData: { title = '' },
  } = props;
  return (
    <div>
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}

IndexPage.getInitialProps = (async (ctx) => {
  const { isServer, todoData } = ctx;
  if (isServer) {
    return {
      todoData,
    };
  }
  return {};
}) as IGetInitialProps;

export default IndexPage;
