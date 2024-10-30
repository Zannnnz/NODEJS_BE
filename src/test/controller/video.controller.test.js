import initModels from "../../models/init-models.js";
import sequelize from "../../models/connect.js";
import {getListVideo} from "../../controllers/video.controller.js"
import sinon from 'sinon'
import {afterEach} from "mocha"
import { expect } from "chai";
const model = initModels(sequelize);
//describe de define 1 bo test case cho controller getVideos
//happy case, case fail
describe('getVideo',()=>{
    let req,res,findAllStub

    beforeEach(()=>{
        //gia lap request va response object
        req={}

        res = {
            status:sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        //gia lap findAll cua model video 
        findAllStub = sinon.stub(model.video,'findAll');
    })

    afterEach(()=>{
        sinon.restore();
    })

    it("return 200 and list of videos",async()=>{
        const videos = [
            {
                "video_id": 1,
                "video_name": "Introduction to Coding",
                "thumbnail": "deadpool.jpg",
                "description": "Learn the basics of coding",
                "views": 1500,
                "source": "youtube.com",
                "user_id": 1,
                "type_id": 2
            }
        ];
        findAllStub.resolves(videos);
        await getListVideo(req,res);

        // kiem tra res.status duoc goi voi 200
        expect(res.status.calledWith(200)).to.be.true;
        // kiểm tra đúng data
        expect(res.json.calledWith(videos)).to.be.true;
    })
})