import LimduClassifier from "./limdu";
const Visit = require("../models/Visit.js");
class ClassifierFactory {

  public static limdu(): Promise<LimduClassifier> {

    return new Promise((resolve, reject) => {
      Visit.find({}, (err: any, visits: any) => {
        const visitArr: { input: string, output: string }[] = [];

        // users.forEach(function (visit: any) {
        //   visitMap[visit._id] = visit;
        // });

        visits.forEach((visit: any) => {
          if (visit.train === true) {
            visitArr.push({ input: visit.content.text, output: visit.content.category });
          }
        });

        const classifier = new LimduClassifier(visitArr);
        // console.log(JSON.stringify(visits));
        console.log("classifier ready");
        return resolve(classifier);
      });

    });
  }

}
const getClassifier = async () => {
  const classifier: LimduClassifier = await ClassifierFactory.limdu();
  return classifier;
};

export default getClassifier;