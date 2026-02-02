import Carousel from "./components/Carousel/Carousel";
import { slides } from "./data/slides";
import './index.css'

function App(){
  return <Carousel slides={slides}/>;
}

export default App;