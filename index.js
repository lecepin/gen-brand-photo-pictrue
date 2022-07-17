import init, { get_exif } from "./pkg/gen_brand_photo_pictrue.js";

const { useState, useRef } = React;
const { Typography, Divider, Button, Form, Input, Select, Upload, message } =
  antd;
const { PlusOutlined, VerticalAlignBottomOutlined } = icons;

init();

function App() {
  const [formValue, setFormValue] = useState({
    model: "XIAOMI 12S ULTRA",
    date: "2022.06.20 22:51:12",
    gps: `51°30'00"N 0°10'00"E`,
    device: "23mm f/1.0 1/320 ISO1495",
    brand: "leica",
    brand_url: "./brand/leica.svg",
  });
  const [imgUrl, setImgUrl] = useState("./simple.jpg");
  const brandList = [
    "Apple",
    "Canon",
    "Dji",
    "Fujifilm",
    "Huawei",
    "Leica",
    "Xiaomi",
    "Nikon Corporation",
    "Sony",
    "未收录",
  ];
  const formRef = useRef();

  const handleDownload = () => {
    const previewDom = document.getElementById("preview");
    const zoomRatio = 4;

    domtoimage
      .toJpeg(previewDom, {
        quality: 0.8,
        width: previewDom.clientWidth * zoomRatio,
        height: previewDom.clientHeight * zoomRatio,
        style: {
          transform: "scale(" + zoomRatio + ")",
          "transform-origin": "top left",
        },
      })
      .then((data) => {
        const binaryString = window.atob(data.split(",")[1]);
        const length = binaryString.length;
        const binaryArray = new Uint8Array(length);

        for (let i = 0; i < length; i++)
          binaryArray[i] = binaryString.charCodeAt(i);

        return new Blob([binaryArray], {
          type: "image/jpeg",
        });
      })
      .then((data) => window.URL.createObjectURL(data))
      .then((data) => {
        const link = document.createElement("a");

        link.download = Date.now() + ".jpg";
        link.href = data;
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  const handleAdd = (file) => {
    const reader = new FileReader();

    reader.onloadend = (e) => {
      try {
        const result = get_exif(new Uint8Array(e.target.result));
        const resultObj = {};

        result.map((item) => (resultObj[item.tag] = item));

        let deviceObj = {
          focalLen:
            resultObj?.FocalLengthIn35mmFilm?.value_with_unit ??
            resultObj?.FocalLength?.value_with_unit,
          fNum: resultObj?.FNumber?.value_with_unit
            ?.split("/")
            ?.map((item, index) => (index == 1 ? (+item).toFixed(1) : item))
            ?.join("/"),
          exposureTime: resultObj?.ExposureTime?.value
            ?.split("/")
            ?.map((item) => ~~item)
            ?.join("/"),
          iso: resultObj?.PhotographicSensitivity?.value,
        };
        let formValue = {
          model: resultObj?.Model?.value,
          date: resultObj?.DateTimeOriginal?.value,
          gps: `${formatGPS(
            resultObj?.GPSLatitude?.value_with_unit
          )} ${formatGPS(resultObj?.GPSLongitude?.value_with_unit)}`,
          device: `${deviceObj.focalLen ? deviceObj.focalLen + " " : ""}${
            deviceObj.fNum ? deviceObj.fNum + " " : ""
          }${deviceObj.exposureTime ? deviceObj.exposureTime + " " : ""}${
            deviceObj.iso ? "ISO " + deviceObj.iso + " " : ""
          }`,
          brand: resultObj?.Make?.value.toLowerCase(),
        };
        formValue.brand_url = `./brand/${
          formValue.brand === "未收录"
            ? "unknow.svg"
            : (formValue?.brand?.toLowerCase() ?? "unknow") + ".svg"
        }`;

        formRef.current.setFieldsValue(formValue);
        setFormValue(formValue);
        setImgUrl(URL.createObjectURL(new Blob([file], { type: file.type })));
      } catch (error) {
        console.log({ error });
        message.error("无法识别照片特定数据，请换一张照片");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <Typography.Title level={1}>生成小米 12S 莱卡水印照片</Typography.Title>
      <div class="preview-box">
        <Typography.Title level={4}>预览</Typography.Title>
        <div class="preview" id="preview">
          <img class="preview-picture" src={imgUrl} />
          <div class="preview-info">
            <div class="preview-info-left">
              <div class="preview-info-model">{formValue.model}</div>
              <div class="preview-info-date">{formValue.date}</div>
              <div class="preview-info-brand">
                <img src={formValue.brand_url} />
              </div>
            </div>
            <div class="preview-info-split"></div>
            <div class="preview-info-right">
              <div class="preview-info-device">{formValue.device}</div>
              <div class="preview-info-gps">{formValue.gps}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="props">
        <Typography.Title level={5}>参数</Typography.Title>
        <Form
          ref={formRef}
          layout="inline"
          size="small"
          onValuesChange={(_, value) => {
            setFormValue({
              ...value,
              brand_url: `./brand/${
                value.brand === "未收录"
                  ? "unknow.svg"
                  : (value?.brand?.toLowerCase() ?? "unknow") + ".svg"
              }`,
            });
          }}
          initialValues={formValue}
        >
          <Form.Item label="型号" name="model">
            <Input />
          </Form.Item>
          <Form.Item label="品牌" name="brand">
            <Select style={{ width: 170 }}>
              {brandList.map((item) => (
                <Select.Option value={item.toLowerCase()}>{item}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="参数" name="device">
            <Input />
          </Form.Item>
          <Form.Item label="时间" name="date">
            <Input />
          </Form.Item>
          {/* <Form.Item label="图标" name="brand_url">
            <Input disabled />
          </Form.Item> */}
          <Form.Item label="经纬" name="gps">
            <Input />
          </Form.Item>
        </Form>
      </div>

      <Divider />
      <div class="op">
        <Upload
          accept="image/*"
          multiple={false}
          beforeUpload={(file) => {
            handleAdd(file);
            return false;
          }}
          fileList={[]}
        >
          <Button type="primary" icon={<PlusOutlined />} ghost>
            新建照片
          </Button>
        </Upload>
        <Button
          type="primary"
          icon={<VerticalAlignBottomOutlined />}
          onClick={handleDownload}
        >
          导出照片
        </Button>
      </div>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("app"));

function formatGPS(gps) {
  if (!gps) {
    return "";
  }

  const [degrees, minutes, seconds, dir] = gps
    .match(/(\d+\.?\d*)|([NSWE]$)/gim)
    .map((item) =>
      !Number.isNaN(Number(item)) ? (~~item < 10 ? "0" + ~~item : ~~item) : item
    );

  return `${degrees}°${minutes}'${seconds}"${dir}`;
}
