const mimir = require("mimir");
const limdu = require("limdu");


export default class LimduClassifier {

  private MyWinnow = limdu.classifiers.Winnow.bind(0, { retrain_count: 10 });
  private intentClassifier = new limdu.classifiers.multilabel.BinaryRelevance({
    binaryClassifierType: this.MyWinnow
  });

  constructor(samples: { input: string, output: string }[]) {
    this.intentClassifier.trainBatch(
      samples.map(item => {
        return { input: mimir.dict(item.input), output: item.output };
      })
    );
    //   [
    //   { input: { I: 1, want: 1, an: 1, apple: 1 }, output: "APPLE" },
    //   { input: { I: 1, want: 1, a: 1, banana: 1 }, output: "BANANA" },
    //   { input: { I: 1, want: 1, chips: 1 }, output: "CHIPS" }
    // ]
  }

  public classify(text: string) {
    return this.intentClassifier.classify(mimir.dict(text));
  }
}