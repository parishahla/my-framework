function parse(url: any) {
  const results = url.match(/\?(?<query>.*)/);
  if (!results) {
    return {};
  }
  const {
    groups: { query },
  } = results;

  const pairs = query.match(/(?<param>\w+)=(?<value>\w+)/g);
  const params = pairs.reduce((acc: any, curr: any) => {
    const [key, value] = curr.split("=");
    acc[key] = value;
    return acc;
  }, {});
  return params;
}

export default parse;
