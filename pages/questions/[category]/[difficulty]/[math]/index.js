import Questions from "../../../../../src/Questions";
export default Questions;
export const getServerSideProps = async (ctx) => ({ props: { ...ctx.params } });
