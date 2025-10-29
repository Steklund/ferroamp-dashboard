import ElprisTable from "../components/ElprisTable";
import "./ElectricPrice.css";

function ElectricPrice() {
  return (
    <div className="rowC">
      <ElprisTable tomorrow={false} />
      <ElprisTable tomorrow={true} />
    </div>
  );
}

export default ElectricPrice;