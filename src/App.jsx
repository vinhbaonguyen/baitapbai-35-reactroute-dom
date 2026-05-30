import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import useFetchMasterData from './hooks/useFetchMasterData';

function App() {
  // Fetch master data 1 lần duy nhất → dispatch vào Redux
  // Tất cả Component con đều dùng useSelector để lấy
  useFetchMasterData();

  return <RouterProvider router={router} />
}

export default App;
