import React, { useState } from "react";
import "./OrderPage.css";
import Material from "../components/Material";
import { useEffect } from "react";
import * as Yup from "yup";
import axios from "axios";

const positionAbolute = {
  price: 85.5,
  counter: 1,
  size: "medium",
  paste: "",
  ingredients: {
    Pepperoni: false,
    Sosis: false,
    "Kanada Jambonu": false,
    "Tavuk Izgara": false,
    Soğan: false,
    Domates: false,
    Mısır: false,
    Sucuk: false,
    Jalepeno: false,
    Sarımsak: false,
    Biber: false,
    Ananas: false,
    Kabak: false,
  },
  addedMaterial: function () {
    return Object.keys(this.ingredients).filter((key) => this.ingredients[key])
      .length;
  },
};

console.log(positionAbolute.addedMaterial());

const OrderPage = () => {
  const [order, setOrder] = useState(positionAbolute);
  const [total, setTotal] = useState(order.price);
  const [isShown, setIsShown] = useState(false);
  const [isError, setIsError] = useState(true);
  const [validationErrors, setValidationErrors] = useState({
    ingredients: "",
    paste: "",
  });

  const handleChange = (e) => {
    const { value, name, checked, type, id } = e.target;
    if (id === "materialList") {
      order.ingredients[name] = checked;
      setOrder({ ...order });
    } else {
      setOrder({
        ...order,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const increaseCounter = (e) => {
    e.preventDefault();
    setOrder({ ...order, counter: order["counter"] + 1 });
  };

  const decreaseCounter = (e) => {
    e.preventDefault();
    if (order.counter > 1) {
      setOrder({ ...order, counter: order["counter"] - 1 });
    }
  };

  const validationSchema = Yup.object().shape({
    ingredients: Yup.object()
      .test("atLeastOneMaterial", "En az 4 tane malzeme seçiniz", (value) => {
        const selectedMaterials = Object.values(value).filter(
          (isChecked) => isChecked
        );
        return selectedMaterials.length >= 4;
      })
      .test(
        "atMostTenMaterials",
        "En fazla 10 tane malzeme seçebilirsiniz",
        (value) => {
          const selectedMaterials = Object.values(value).filter(
            (isChecked) => isChecked
          );
          return selectedMaterials.length <= 10;
        }
      ),
    paste: Yup.string().required("Lütfen hamur tipini seçiniz"),
  });

  const validationFunction = async () => {
    try {
      await validationSchema.validate(order, { abortEarly: false });
      setIsError(false);
      setValidationErrors({});
    } catch (errors) {
      const object = {};
      // errrors.inner returns an array and we can reach error messages and key values
      errors.inner.forEach((error) => {
        object[error.path] = error.message;
      });

      if (!Object.keys(object).includes("paste")) {
        object.paste = "";
      }
      if (!Object.keys(object).includes("ingredients")) {
        object.ingredients = "";
      }

      setValidationErrors(object);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsShown(true);
    const summary = { ...order };
    summary.totalPrice = total.toFixed(2);

    if (!isError) {
      axios
        .post("https://reqres.in/api/users", summary)
        .then(function (response) {
          console.log("post request is succesful", response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  let sizeM = 1;
  let thicknessM = 1;
  useEffect(() => {
    order.size === "large"
      ? (sizeM = 1.1)
      : order.size === "small"
      ? (sizeM = 0.9)
      : (sizeM = 1);
    order.paste === "thick"
      ? (thicknessM = 1.1)
      : order.paste === "thin"
      ? (thicknessM = 0.9)
      : (thicknessM = 1);

    setTotal(
      order.price * order.counter * sizeM * thicknessM +
        order.addedMaterial() * 5
    );
    console.log("order", order);
    console.log("number of added material ", order.addedMaterial());
  }, [order]);

  useEffect(() => {
    validationFunction();
    console.log(validationErrors);
  }, [order]);

  return (
    <div className="orderPage">
      <header>
        <h1>TEKNOLOJİK YEMEKLER</h1>
      </header>
      <section>
        <h3>Position Absolute Acı Pizza</h3>
        <p>
          <span>85.50 TL</span>
          <span>4.9 </span>
          <span>200</span>
        </p>
        <p>
          Frontent Dev olarak hala position:absolute kullanıyorsan bu çok acı
          pizza tam sana göre. Pizza, domates, peynir ve genellikle çeşitli
          diğer malzemelerle kaplanmış, daha sonra geleneksel olarak odun
          ateşinde bir fırında yüksek sıcaklıkta pişirilen, genellikle yuvarlak,
          düzleştirilmiş mayalı buğday bazlı hamurdan oluşan İtalyan kökenli
          lezzetli bir yemektir. . Küçük bir pizzaya bazen pizzetta denir.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="size">
            <p>Boyut Seç</p>
            <label>
              <input
                onChange={handleChange}
                type="radio"
                name="size"
                value="small"
              />
              Küçük
            </label>
            <label>
              <input
                type="radio"
                name="size"
                onChange={handleChange}
                value="medium"
                defaultChecked
              />
              Orta
            </label>
            <label>
              <input
                type="radio"
                name="size"
                onChange={handleChange}
                value="large"
              />
              Büyük
            </label>
          </div>
          <div className="paste">
            <p>
              Hamur Seç
              {isShown && (
                <span className="errorMessage">{validationErrors.paste}</span>
              )}
            </p>

            <select
              name="paste"
              defaultValue={"default"}
              onChange={handleChange}
            >
              <option value="default" disabled>
                Lütfen hamur tipini seç
              </option>
              <option value="thin">İnce Hamur</option>
              <option value="normal">Normal Hamur</option>
              <option value="thick">Kalın Hamur</option>
            </select>
          </div>
          <div className="materials">
            <p>
              Ek Malzemeler
              {isShown && (
                <span className="errorMessage">
                  {validationErrors.ingredients}
                </span>
              )}
            </p>

            <p>En fazla 10 malzeme seçebilirsiniz. 5TL</p>
            <p className="additionalMaterials">
              {Object.keys(positionAbolute.ingredients).map(
                (material, index) => (
                  <Material
                    key={index}
                    list={material}
                    handleChange={handleChange}
                  />
                )
              )}
            </p>

            <p>Sipariş Notu</p>

            <input
              className="note"
              name="orderNote"
              onChange={handleChange}
              placeholder="Siparişine eklemek istediğin bir not var mı ?"
            />
          </div>

          <div className="priceCalculation">
            <div className="counter">
              <button onClick={decreaseCounter}>-</button>
              <p>{order.counter}</p>
              <button onClick={increaseCounter}>+</button>
            </div>
            <div className="summary">
              <p>Sipariş Toplamı</p>
              <p>
                <span>Seçimler</span>
                <span>{order.addedMaterial() * 5}</span>
              </p>
              <p>
                <span>Toplam</span>
                <span>{total.toFixed(2)}</span>
              </p>
              <button type="submit"> Sipariş Ver</button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default OrderPage;
