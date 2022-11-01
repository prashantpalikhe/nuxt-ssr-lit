module.exports = function (source) {
  const regex = /import\.meta/g;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require("path");
  return source.replace(regex, () => {
    // return `({ url: getAbsoluteUrl('${browserPath}/${fileName}') })`;
    return `({ url: 'file://${path.resolve(this.resource)}' })`;
  });
};
