const mimir = require("mimir");
const limdu = require("limdu");


export default class LimduClassifier {

  private MyWinnow = limdu.classifiers.Winnow.bind(0, { retrain_count: 10 });
  private intentClassifier = new limdu.classifiers.multilabel.BinaryRelevance({
    binaryClassifierType: this.MyWinnow
  });

  constructor(samples: { input: string, output: string }[]) {

    const replacedSamples = samples.map(item => {
      try {
        const d = mimir.dict(item.input).dict;
        d[""] = 0; // Patch

        // const removedNans = Object.keys(d).reduce((prev: any, curr: any) => {
        //   if (d[curr] !== NaN) {
        //     prev[curr] = d[curr];
        //   }
        //   return prev;
        // }, {});

        return { input: d, output: item.output };
      } catch (err) {
        console.log("ERROR " + err + " " + item.input);
      }
    });

    // console.log(replacedSamples);

    this.intentClassifier.trainBatch(replacedSamples);

  }

  public classify(text: string) {
    const d = mimir.dict(text).dict;
    d[""] = 0; // Patch
    return this.intentClassifier.classify(d);
  }
}