package com.pgmanagement.controller;
import com.pgmanagement.config.PgContext;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/pg-workspaces")
public class PgWorkspaceController {
    @GetMapping public Map<String,Object> current(){String code=PgContext.get();return Map.of("code",code,"name",code.equals("SUBASH-PG")?"SUBASH PG":"AKKA PG","workspaces",List.of(Map.of("code","AKKA-PG","name","AKKA PG"),Map.of("code","SUBASH-PG","name","SUBASH PG")));}
}
